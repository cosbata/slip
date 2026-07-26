'use client'
import { useState } from 'react'

const REASONS = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'DEFAMATION', label: 'Defamation' },
  { value: 'NAMES_INDIVIDUAL', label: 'Names an individual' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'NDA_VIOLATION', label: 'NDA violation' },
  { value: 'OTHER', label: 'Other' },
]

export function ReportButton({ targetType, targetId }: { targetType: 'POST' | 'COMMENT'; targetId: string }) {
  const [open, setOpen] = useState(false)
  const [category, setCategory] = useState('')
  const [freeText, setFreeText] = useState('')
  const [sent, setSent] = useState(false)

  async function submit() {
    if (!category) return
    await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetType, targetId, category, freeText }),
    })
    setSent(true)
    setOpen(false)
  }

  if (sent) return <span style={{ fontSize: '12px', color: '#818384' }}>Reported</span>

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ fontSize: '12px', color: '#818384', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
      >
        Report
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '20px', zIndex: 300,
          backgroundColor: '#1A1A1B', border: '1px solid #343536',
          borderRadius: '8px', padding: '12px', width: '240px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          display: 'flex', flexDirection: 'column', gap: '8px',
        }}>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{
              width: '100%', padding: '6px 10px', backgroundColor: '#272729',
              border: '1px solid #343536', borderRadius: '4px',
              color: category ? '#D7DADC' : '#818384', fontSize: '13px',
              outline: 'none', fontFamily: 'inherit',
            }}
          >
            <option value="">Select reason</option>
            {REASONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <textarea
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
            placeholder="Additional details (optional)"
            rows={2}
            style={{
              width: '100%', padding: '6px 10px', backgroundColor: '#272729',
              border: '1px solid #343536', borderRadius: '4px',
              color: '#D7DADC', fontSize: '13px', resize: 'none',
              outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={submit}
              disabled={!category}
              style={{
                padding: '5px 14px', backgroundColor: category ? '#FFFFFF' : '#343536',
                border: 'none', borderRadius: '20px',
                color: category ? '#0D0D0D' : '#818384',
                fontSize: '12px', cursor: category ? 'pointer' : 'default', fontFamily: 'inherit',
              }}
            >Submit</button>
            <button
              onClick={() => setOpen(false)}
              style={{
                padding: '5px 14px', backgroundColor: 'transparent',
                border: '1px solid #343536', borderRadius: '20px',
                color: '#818384', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
