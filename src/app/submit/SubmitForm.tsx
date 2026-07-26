'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TrustExplainer } from '@/components/TrustExplainer'
import dynamic from 'next/dynamic'
import { CommunityPicker } from '@/components/CommunityPicker'
import type { Community } from '@/components/CommunityPicker'

const MIN_TITLE_LENGTH = 10
const MIN_CONTENT_LENGTH = 80

function plainTextLength(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().length
}

const BodyEditor = dynamic(
  () => import('@/components/BodyEditor').then(m => ({ default: m.BodyEditor })),
  {
    ssr: false,
    loading: () => (
      <div style={{ minHeight: '200px', border: '1px solid #343536', borderRadius: '4px', padding: '14px' }} />
    ),
  }
)

// ── Generic ComboInput ────────────────────────────────────────────────────────
interface Suggestion { label: string; sub?: string }

function ComboInput({
  value, onChange, placeholder, suggestions, inputStyle,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  suggestions: Suggestion[]
  inputStyle: React.CSSProperties
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)


  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = query.trim()
    ? suggestions.filter(s =>
        s.label.toLowerCase().includes(query.toLowerCase()) ||
        (s.sub?.toLowerCase().includes(query.toLowerCase()) ?? false)
      )
    : suggestions

  function select(label: string) {
    setQuery(label); onChange(label); setOpen(false)
  }

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          style={{ ...inputStyle, padding: '9px 36px 9px 12px', fontSize: '13px', width: '100%', boxSizing: 'border-box' }}
        />
        <button
          type="button" tabIndex={-1}
          onClick={() => { setOpen(o => !o); inputRef.current?.focus() }}
          style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#818384', padding: 0, display: 'flex' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 300,
          backgroundColor: '#1A1A1B', border: '1px solid #343536', borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)', maxHeight: '240px', overflowY: 'auto',
        }}>
          {filtered.map((s, i) => (
            <button
              key={i} type="button"
              onClick={() => select(s.label)}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#272729' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent' }}
              style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '9px 14px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit' }}
            >
              <span style={{ fontSize: '13px', color: '#D7DADC' }}>{s.label}</span>
              {s.sub && <span style={{ fontSize: '11px', color: '#555', marginLeft: 'auto' }}>{s.sub}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Suggestion data ────────────────────────────────────────────────────────────
const STAGE_SUGGESTIONS: Suggestion[] = [
  { label: 'Resume Screen' },
  { label: 'Online Assessment', sub: 'OA' },
  { label: 'Technical Phone Screen' },
  { label: 'Hiring Manager Screen' },
  { label: 'Phone Interview' },
  { label: 'Onsite / Virtual Onsite' },
  { label: 'System Design' },
  { label: 'Behavioral' },
  { label: 'Final Round' },
  { label: 'Offer Rescinded' },
]

const ROLE_SUGGESTIONS: Suggestion[] = [
  { label: 'Software Engineer', sub: 'SWE' },
  { label: 'Senior Software Engineer', sub: 'SWE II' },
  { label: 'Staff Engineer' },
  { label: 'Product Manager', sub: 'PM' },
  { label: 'Senior Product Manager', sub: 'Senior PM' },
  { label: 'Data Scientist' },
  { label: 'Machine Learning Engineer', sub: 'MLE' },
  { label: 'Research Scientist' },
  { label: 'UX Designer' },
  { label: 'Engineering Manager', sub: 'EM' },
  { label: 'Solutions Architect' },
  { label: 'New Grad / L3 / E3', sub: 'Entry level' },
  { label: 'Intern' },
]

const OUTCOME_SUGGESTIONS: Suggestion[] = [
  { label: 'Got hired somewhere else' },
  { label: 'Still searching' },
  { label: 'Started my own company' },
  { label: 'Joined a bootcamp or program' },
  { label: 'Took a break' },
  { label: 'Changed career direction' },
  { label: 'Got the same role at a different level' },
  { label: 'Freelancing' },
  { label: 'Other' },
]

const INVESTOR_OUTCOME_SUGGESTIONS: Suggestion[] = [
  { label: 'Raised funding elsewhere' },
  { label: 'Still fundraising' },
  { label: 'Bootstrapped instead' },
  { label: 'Joined an accelerator' },
  { label: 'Pivoted the product' },
  { label: 'Shut down' },
  { label: 'Other' },
]

function ImageVideoUploader({ onUpload, inputStyle }: { onUpload: (urls: string[]) => void; inputStyle: React.CSSProperties }) {
  const [files, setFiles] = useState<{ name: string; url: string; type: string }[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFiles(fileList: FileList) {
    setUploading(true)
    const uploaded: { name: string; url: string; type: string }[] = []
    for (const file of Array.from(fileList)) {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) uploaded.push({ name: file.name, url: data.file.url, type: file.type })
    }
    // Fix: call onUpload outside the state updater to avoid setState-during-render
    setFiles(prev => {
      const next = [...prev, ...uploaded]
      setTimeout(() => onUpload(next.map(f => f.url)), 0)
      return next
    })
    setUploading(false)
  }

  function removeFile(i: number) {
    const next = files.filter((_, j) => j !== i)
    setFiles(next)
    onUpload(next.map(f => f.url))
  }

  const hasFiles = files.length > 0

  return (
    <div style={{ border: '1px solid #343536', borderRadius: '4px', marginBottom: '16px', overflow: 'hidden' }}>
      {/* When files exist: show full-width previews inside the box */}
      {hasFiles ? (
        <div style={{ position: 'relative' }}>
          {/* Grid of uploaded files filling the box */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: files.length === 1 ? '1fr' : 'repeat(2, 1fr)',
            gap: '2px',
          }}>
            {files.map((f, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: files.length === 1 ? '16/9' : '1/1' }}>
                {f.type.startsWith('video') ? (
                  <video src={f.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={f.url} alt={f.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                )}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  style={{ position: 'absolute', top: '6px', right: '6px', width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
          {/* Add more button */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            style={{ width: '100%', padding: '10px', background: '#1a1a1b', border: 'none', borderTop: '1px solid #343536', color: '#818384', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Add more
          </button>
        </div>
      ) : (
        /* Empty drop zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#D7DADC' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'transparent' }}
          onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
          style={{ padding: '40px 24px', textAlign: 'center', cursor: 'pointer' }}
        >
          {uploading ? (
            <p style={{ color: '#818384', fontSize: '14px', margin: 0 }}>Uploading...</p>
          ) : (
            <>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818384" strokeWidth="1.5" style={{ marginBottom: '8px' }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="#818384" stroke="none"/><path d="M21 15l-5-5L5 21"/>
              </svg>
              <p style={{ color: '#D7DADC', fontSize: '14px', margin: '0 0 4px' }}>Drag & drop or click to upload</p>
              <p style={{ color: '#818384', fontSize: '12px', margin: 0 }}>Images and videos supported</p>
            </>
          )}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*,video/*" multiple hidden onChange={e => { if (e.target.files) { handleFiles(e.target.files); e.target.value = '' } }} />
    </div>
  )
}

// ── Main form ─────────────────────────────────────────────────────────────────
interface Props {
  communities: Community[]
  defaultCommunitySlug: string
}

export function SubmitForm({ communities, defaultCommunitySlug }: Props) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [communitySlug, setCommunitySlug] = useState(defaultCommunitySlug)
  const [subSlug, setSubSlug] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showTagInput, setShowTagInput] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [mediaUrls, setMediaUrls] = useState<string[]>([])
  const [interviewStage, setInterviewStage] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [outcomeCategory, setOutcomeCategory] = useState('')
  const [investorOutcome, setInvestorOutcome] = useState('')
  const router = useRouter()
  useSearchParams() // keep for future use

  // Sub-communities of the selected parent
  const subCommunities = communities.filter(c => {
    const parts = c.slug.split('/')
    if (parts.length !== 3) return false
    const parentSlug = parts.slice(0, 2).join('/')
    return parentSlug === communitySlug
  })

  const parentCommunities = communities.filter(c => c.slug.split('/').length === 2)

  // Final slug: prefer sub, else parent
  const finalSlug = subSlug || communitySlug

  const selectedCommunity = communities.find(c => c.slug === finalSlug) ?? null
  const communityTrack = selectedCommunity?.track ?? null

  function addTag(val: string) {
    const trimmed = val.trim().toLowerCase().replace(/\s+/g, '-')
    if (trimmed && !tags.includes(trimmed) && tags.length < 5) {
      setTags(prev => [...prev, trimmed])
    }
    setTagInput('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!communitySlug) {
      setCommunityError(true)
      return
    }
    setFormError('')
    const trimmedTitle = title.trim()
    const trimmedContentLength = plainTextLength(content)
    if (trimmedTitle.length < MIN_TITLE_LENGTH) {
      setFormError(`Title must be at least ${MIN_TITLE_LENGTH} characters.`)
      return
    }
    if (trimmedContentLength < MIN_CONTENT_LENGTH) {
      setFormError(`Add at least ${MIN_CONTENT_LENGTH} characters of context: what happened, what stage, and what others can learn.`)
      return
    }
    setLoading(true)
    const isLink = linkUrl.trim().length > 0

    // Embed uploaded images into body HTML
    const imageHtml = mediaUrls.map(url =>
      `<img src="${url}" style="max-width:100%;border-radius:4px;margin:8px 0;display:block;" />`
    ).join('')
    const finalContent = (content.trim() + imageHtml).trim() || null

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: trimmedTitle,
        content: finalContent,
        communitySlug: finalSlug || null,
        tags,
        embedUrl: isLink ? linkUrl : null,
        embedType: isLink ? 'link' : null,
      }),
    })
    if (res.ok) { router.refresh(); router.push('/') }
    else {
      const data = await res.json().catch(() => null)
      setFormError(data?.error ?? 'Failed to submit. Please try again.')
    }
    setLoading(false)
  }

  const [communityError, setCommunityError] = useState(false)
  const contentChars = plainTextLength(content)
  const canSubmit = title.trim().length >= MIN_TITLE_LENGTH && contentChars >= MIN_CONTENT_LENGTH

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'transparent',
    border: '1px solid #343536',
    borderRadius: '4px',
    color: '#D7DADC',
    fontSize: '14px',
    padding: '12px 16px',
    outline: 'none',
    fontFamily: 'inherit',
  }

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '20px 24px' }}>
      {/* Header row: title + community picker */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#D7DADC', margin: 0 }}>Create Post</h1>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <CommunityPicker
            communities={parentCommunities}
            defaultSlug={communitySlug}
            name="communitySlug"
            onChange={slug => { setCommunitySlug(slug); setSubSlug(''); setCommunityError(false) }}
          />
          {communityError && (
            <span style={{ fontSize: '12px', color: '#FF4500' }}>커뮤니티를 선택해 주세요</span>
          )}
        </div>
      </div>

      <TrustExplainer />

      {/* Sub-community row */}
      {communitySlug && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {subCommunities.map(sc => {
            const label = sc.slug.split('/').pop()?.toUpperCase() ?? sc.name
            const active = subSlug === sc.slug
            return (
              <button
                key={sc.slug}
                type="button"
                onClick={() => setSubSlug(active ? '' : sc.slug)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  border: `1px solid ${active ? '#D7DADC' : '#343536'}`,
                  background: active ? '#343536' : 'transparent',
                  color: active ? '#D7DADC' : '#818384',
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                {label}
              </button>
            )
          })}
          {/* Create new sub-community */}
          <Link
            href={`/community/create?parent=${communitySlug}`}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 10px', borderRadius: '20px',
              border: '1px dashed #444',
              color: '#818384', fontSize: '12px',
              textDecoration: 'none',
            }}
            title="Create a new sub-community"
          >
            <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span> New sub
          </Link>
          {subCommunities.length > 0 && (
            <span style={{ fontSize: '11px', color: '#555', marginLeft: '2px' }}>
              {subSlug ? '' : '(posting to main)'}
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ paddingTop: '16px' }}>
        {/* Title */}
        <div style={{ marginBottom: '8px' }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
            maxLength={300}
            placeholder="Title*"
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
          />
          <div style={{ textAlign: 'right', marginTop: '4px' }}>
            <span style={{ fontSize: '11px', color: title.length > 280 ? '#FF6060' : '#818384' }}>
              {title.length}/300
            </span>
          </div>
        </div>

        {/* Post — text + media combined */}
        <>
          <BodyEditor onChange={setContent} placeholder="What happened? What stage? What would help the next person?" />
          <ImageVideoUploader onUpload={setMediaUrls} inputStyle={inputStyle} />
          <div style={{ marginBottom: '16px' }}>
            <input
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              placeholder="Add a link (optional)"
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
            />
            <div style={{ marginTop: '6px', fontSize: '11px', color: contentChars >= MIN_CONTENT_LENGTH ? '#818384' : '#FFB000' }}>
              {contentChars}/{MIN_CONTENT_LENGTH} characters of story context required
            </div>
          </div>
        </>

        {/* Tags */}
        <div style={{ marginBottom: '16px' }}>
          {tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {tags.map(tag => (
                <span
                  key={tag}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px',
                    padding: '3px 10px', borderRadius: '20px',
                    border: '1px solid #343536', color: '#D7DADC', fontSize: '12px',
                  }}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => setTags(prev => prev.filter(t => t !== tag))}
                    style={{ background: 'none', border: 'none', color: '#818384', cursor: 'pointer', padding: '0', fontSize: '14px', lineHeight: 1, display: 'flex' }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {showTagInput ? (
            <input
              autoFocus
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput) }
                if (e.key === 'Escape') { setShowTagInput(false); setTagInput('') }
              }}
              onBlur={() => { if (tagInput.trim()) addTag(tagInput); else setShowTagInput(false) }}
              placeholder="Add a tag (press Enter)"
              style={{ ...inputStyle, padding: '8px 12px', fontSize: '13px' }}
            />
          ) : (
            tags.length < 5 && (
              <button
                type="button"
                onClick={() => setShowTagInput(true)}
                style={{
                  background: 'none', border: 'none',
                  color: '#0079d3', fontSize: '13px', cursor: 'pointer',
                  padding: '4px 0', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px',
                }}
              >
                <span style={{ fontSize: '16px', lineHeight: 1 }}>+</span> Add a tag
              </button>
            )
          )}
        </div>

        {/* Structured fields — always visible, adapts to track */}
        <div style={{ border: '1px solid #343536', borderRadius: '4px', padding: '14px 16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#818384', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {communityTrack === 'INVESTORS' ? 'Pitch details (optional)' : 'Rejection details (optional)'}
          </p>
          <ComboInput
            value={roleTitle}
            onChange={setRoleTitle}
            placeholder="Role / Position (e.g. Software Engineer L5)"
            suggestions={ROLE_SUGGESTIONS}
            inputStyle={inputStyle}
          />
          {communityTrack !== 'INVESTORS' && (
            <ComboInput
              value={interviewStage}
              onChange={setInterviewStage}
              placeholder="Interview stage (type or select)"
              suggestions={STAGE_SUGGESTIONS}
              inputStyle={inputStyle}
            />
          )}
          {communityTrack === 'INVESTORS' && (
            <>
              <select style={{ ...inputStyle, padding: '9px 12px', fontSize: '13px' }}>
                <option value="">Funding stage</option>
                <option value="PRE_SEED">Pre-seed</option>
                <option value="SEED">Seed</option>
                <option value="SERIES_A">Series A</option>
                <option value="SERIES_B">Series B</option>
                <option value="SERIES_C">Series C+</option>
              </select>
              <select style={{ ...inputStyle, padding: '9px 12px', fontSize: '13px' }}>
                <option value="">Amount sought</option>
                <option value="UNDER_100K">Under $100K</option>
                <option value="100K_500K">$100K–$500K</option>
                <option value="500K_1M">$500K–$1M</option>
                <option value="1M_5M">$1M–$5M</option>
                <option value="5M_PLUS">$5M+</option>
              </select>
              <input placeholder="Industry vertical (optional)" style={{ ...inputStyle, padding: '9px 12px', fontSize: '13px' }} onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }} onBlur={e => { e.currentTarget.style.borderColor = '#343536' }} />
            </>
          )}
          <ComboInput
            value={communityTrack === 'INVESTORS' ? investorOutcome : outcomeCategory}
            onChange={communityTrack === 'INVESTORS' ? setInvestorOutcome : setOutcomeCategory}
            placeholder="What happened after? (optional)"
            suggestions={communityTrack === 'INVESTORS' ? INVESTOR_OUTCOME_SUGGESTIONS : OUTCOME_SUGGESTIONS}
            inputStyle={inputStyle}
          />
        </div>

        {formError && (
          <p style={{ margin: '0 0 12px', color: '#FF6060', fontSize: '13px', lineHeight: 1.5 }}>
            {formError}
          </p>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '16px', borderTop: '1px solid #343536' }}>
          <button
            type="button"
            onClick={() => router.back()}
            style={{
              padding: '8px 18px', backgroundColor: 'transparent',
              border: '1px solid #343536', borderRadius: '20px',
              color: '#818384', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={{
              padding: '8px 20px',
              backgroundColor: canSubmit ? '#FF4500' : '#343536',
              border: 'none', borderRadius: '20px',
              color: canSubmit ? '#FFFFFF' : '#818384',
              fontSize: '14px', fontWeight: 500,
              cursor: canSubmit ? 'pointer' : 'not-allowed', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}
