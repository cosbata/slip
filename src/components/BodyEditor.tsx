'use client'
import { useRef, useEffect } from 'react'

interface Props {
  onChange: (html: string) => void
  placeholder?: string
  initialContent?: string
}

export function BodyEditor({ onChange, placeholder = 'Body text (optional)', initialContent }: Props) {
  const editorRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialContent && editorRef.current) {
      editorRef.current.innerHTML = initialContent
      onChange(initialContent)
    }
    updatePlaceholder()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function updatePlaceholder() {
    const el = editorRef.current
    if (!el) return
    if ((el.textContent ?? '').trim() === '' && el.innerHTML.replace(/<br\s*\/?>/gi, '') === '') {
      el.setAttribute('data-empty', 'true')
    } else {
      el.removeAttribute('data-empty')
    }
  }

  function exec(cmd: string, value?: string) {
    editorRef.current?.focus()
    document.execCommand(cmd, false, value)
    onChange(editorRef.current?.innerHTML ?? '')
    updatePlaceholder()
  }

  // Toggle block-level formatting (h3, blockquote, pre) — revert to <p> if already applied
  function toggleBlock(tag: string) {
    editorRef.current?.focus()
    const bare = tag.replace(/[<>]/g, '').toLowerCase()
    const current = document.queryCommandValue('formatBlock').toLowerCase()
    document.execCommand('formatBlock', false, current === bare ? '<p>' : tag)
    onChange(editorRef.current?.innerHTML ?? '')
    updatePlaceholder()
  }

  function handleInput() {
    updatePlaceholder()
    onChange(editorRef.current?.innerHTML ?? '')
  }

  function handleLink() {
    const sel = window.getSelection()?.toString() || ''
    const url = window.prompt('Enter URL:', 'https://')
    if (!url) return
    if (sel) exec('createLink', url)
    else exec('insertHTML', `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`)
  }

  async function insertImage(file: File) {
    const fd = new FormData()
    fd.append('image', file)
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) exec('insertImage', data.file.url)
    } catch {
      alert('Image upload failed')
    }
  }

  type ToolbarItem = { label: React.ReactNode; action: () => void; title: string } | 'sep'

  const toolbar: ToolbarItem[] = [
    { title: 'Bold',          label: <b style={{ fontSize: 13 }}>B</b>,                   action: () => exec('bold') },
    { title: 'Italic',        label: <i style={{ fontSize: 13 }}>I</i>,                   action: () => exec('italic') },
    { title: 'Strikethrough', label: <s style={{ fontSize: 13 }}>S</s>,                   action: () => exec('strikethrough') },
    { title: 'Superscript',   label: <span style={{ fontSize: 11 }}>X²</span>,            action: () => exec('superscript') },
    { title: 'Heading',       label: <span style={{ fontSize: 12, fontWeight: 600 }}>H</span>, action: () => toggleBlock('<h3>') },
    'sep',
    { title: 'Link', action: handleLink, label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg> },
    { title: 'Insert image', action: () => fileInputRef.current?.click(), label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" stroke="none"/><path d="M21 15l-5-5L5 21"/></svg> },
    'sep',
    { title: 'Bullet list', action: () => exec('insertUnorderedList'), label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg> },
    { title: 'Numbered list', action: () => exec('insertOrderedList'), label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><path d="M5 6l-2 2 2 2M5 14l-2 2 2 2" strokeLinecap="round"/></svg> },
    'sep',
    { title: 'Blockquote', action: () => toggleBlock('<blockquote>'), label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg> },
    { title: 'Code block', action: () => toggleBlock('<pre>'), label:
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> },
  ]

  const btnStyle: React.CSSProperties = {
    minWidth: 26, height: 26, padding: '0 3px', border: 'none',
    backgroundColor: 'transparent', color: '#D7DADC', cursor: 'pointer',
    borderRadius: 2, display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: 'inherit',
  }

  return (
    <>
      <style>{`
        .rb-body[data-empty="true"]::before {
          content: attr(data-placeholder);
          color: #818384;
          pointer-events: none;
          position: absolute;
        }
        .rb-body { position: relative; }
        .rb-body a { color: #0079d3; text-decoration: underline; }
        .rb-body img { max-width: 100%; border-radius: 4px; margin: 8px 0; display: block; }
        .rb-body blockquote { border-left: 3px solid #444; padding-left: 12px; color: #818384; margin: 6px 0; }
        .rb-body pre { background: #0d1117; padding: 10px 14px; border-radius: 4px; font-size: 13px; font-family: monospace; overflow-x: auto; margin: 6px 0; }
        .rb-body h3 { font-size: 17px; font-weight: 600; margin: 10px 0 4px; color: #D7DADC; }
        .rb-body ul, .rb-body ol { padding-left: 22px; margin: 4px 0; }
        .rb-body li { margin: 2px 0; }
      `}</style>

      <div style={{ border: '1px solid #343536', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 1, padding: '6px 10px', borderBottom: '1px solid #343536', flexWrap: 'wrap' }}>
          {toolbar.map((item, i) =>
            item === 'sep'
              ? <div key={i} style={{ width: 1, height: 18, background: '#343536', margin: '0 5px' }} />
              : (
                <button
                  key={i} type="button" title={item.title}
                  style={btnStyle}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#343536' }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
                  onMouseDown={e => { e.preventDefault(); item.action() }}
                >
                  {item.label}
                </button>
              )
          )}
        </div>

        {/* Editable body */}
        <div
          ref={editorRef}
          className="rb-body"
          contentEditable
          suppressContentEditableWarning
          data-placeholder={placeholder}
          onInput={handleInput}
          onBlur={handleInput}
          style={{
            minHeight: 200, padding: '14px 16px',
            color: '#D7DADC', fontSize: 14, lineHeight: 1.6,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
      </div>

      <input
        ref={fileInputRef} type="file" accept="image/*" hidden
        onChange={e => { const f = e.target.files?.[0]; if (f) { e.target.value = ''; insertImage(f) } }}
      />
    </>
  )
}
