'use client'
import { useState } from 'react'

export function CommunityRules({ rules, institution }: { rules: string[]; institution: string }) {
  const [expanded, setExpanded] = useState<number | null>(null)
  if (!rules.length) return null

  return (
    <div style={{ backgroundColor: 'transparent', borderRadius: '0', marginBottom: '12px' }}>
      <p style={{
        fontSize: '12px', fontWeight: 400, color: '#818384',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        margin: 0, padding: '12px 16px',
        borderBottom: '1px solid #1e1f20',
      }}>
        {institution.toUpperCase()} Community Rules
      </p>
      {rules.map((rule, i) => {
        // Support "Title||Description" format; fallback to title-only
        const raw = rule.replace(/^\d+\.\s*/, '')
        const sepIdx = raw.indexOf('||')
        const title = sepIdx >= 0 ? raw.slice(0, sepIdx).trim() : raw.trim()
        const desc  = sepIdx >= 0 ? raw.slice(sepIdx + 2).trim() : ''
        const hasDesc = desc.length > 0
        const isOpen = expanded === i
        return (
          <div key={i}>
            <button
              onClick={() => hasDesc ? setExpanded(isOpen ? null : i) : undefined}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '12px 16px',
                background: 'none', border: 'none',
                borderBottom: !isOpen && i < rules.length - 1 ? '1px solid #1e1f20' : 'none',
                cursor: hasDesc ? 'pointer' : 'default', textAlign: 'left', gap: '12px',
                fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '14px', color: '#818384', minWidth: '16px', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: '14px', color: '#D7DADC', lineHeight: 1.4 }}>{title}</span>
              </div>
              {hasDesc && (
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2"
                  style={{
                    transform: isOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.15s', flexShrink: 0, color: '#818384',
                  }}
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" />
                </svg>
              )}
            </button>
            {isOpen && hasDesc && (
              <div style={{
                padding: '4px 16px 12px 48px',
                borderBottom: i < rules.length - 1 ? '1px solid #1e1f20' : 'none',
              }}>
                <p style={{ fontSize: '13px', color: '#818384', margin: 0, lineHeight: 1.5 }}>
                  {desc}
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
