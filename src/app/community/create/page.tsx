'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CommunityPicker } from '@/components/CommunityPicker'
import type { Community as PickerCommunity } from '@/components/CommunityPicker'

type Tab = 'Company Community' | 'Sub-community'

interface Community {
  id: string
  slug: string
  name: string
  track: string
  parentCommunityId: string | null
  institutionLogoUrl: string | null
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  backgroundColor: 'transparent',
  border: '1px solid #343536',
  borderRadius: '8px',
  color: '#D7DADC',
  fontSize: '14px',
  padding: '12px 16px',
  outline: 'none',
  fontFamily: 'inherit',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

export default function CreateCommunityPage() {
  const [tab, setTab] = useState<Tab>('Company Community')

  // Company tab state
  const [companyName, setCompanyName] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [companyLoading, setCompanyLoading] = useState(false)
  const [companyResult, setCompanyResult] = useState<{ ok: boolean; communitySlug?: string; error?: string } | null>(null)

  // Subcommunity tab state
  const [parentCommunities, setParentCommunities] = useState<Community[]>([])
  const [parentCommunitySlug, setParentCommunitySlug] = useState('')
  const [subCommunityName, setSubCommunityName] = useState('')
  const [subLoading, setSubLoading] = useState(false)
  const [subResult, setSubResult] = useState<{ ok: boolean; communitySlug?: string; error?: string } | null>(null)

  useEffect(() => {
    fetch('/api/communities')
      .then(r => r.json())
      .then((data: Community[]) => {
        // Only top-level communities (no parent)
        setParentCommunities(data.filter(c => c.parentCommunityId === null))
      })
      .catch(() => {})
  }, [])

  async function handleCompanySubmit(e: React.FormEvent) {
    e.preventDefault()
    setCompanyLoading(true)
    setCompanyResult(null)
    try {
      const res = await fetch('/api/community-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'COMPANY', companyName, websiteUrl }),
      })
      const data = await res.json()
      setCompanyResult(data)
      if (data.ok) {
        setCompanyName('')
        setWebsiteUrl('')
      }
    } catch {
      setCompanyResult({ ok: false, error: 'Request failed.' })
    }
    setCompanyLoading(false)
  }

  async function handleSubSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubLoading(true)
    setSubResult(null)
    try {
      const res = await fetch('/api/community-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SUBCOMMUNITY', parentCommunitySlug, subCommunityName }),
      })
      const data = await res.json()
      setSubResult(data)
      if (data.ok) {
        setSubCommunityName('')
        setParentCommunitySlug('')
      }
    } catch {
      setSubResult({ ok: false, error: 'Request failed.' })
    }
    setSubLoading(false)
  }

  const tabs: Tab[] = ['Company Community', 'Sub-community']

  return (
    <div style={{ maxWidth: '740px', margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '18px', fontWeight: 400, color: '#D7DADC', margin: 0 }}>Create Community</h1>
      </div>

      {/* Main card */}
      <div style={{ backgroundColor: 'transparent', border: 'none', borderRadius: '0' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #343536' }}>
          {tabs.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => { setTab(t); setCompanyResult(null); setSubResult(null) }}
              style={{
                padding: '12px 16px',
                border: 'none',
                background: 'transparent',
                color: tab === t ? '#D7DADC' : '#818384',
                borderBottom: tab === t ? '2px solid #D7DADC' : '2px solid transparent',
                fontWeight: tab === t ? 500 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                marginBottom: '-1px',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ padding: '24px' }}>
          {/* Company tab */}
          {tab === 'Company Community' && (
            <form onSubmit={handleCompanySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
                  Company name *
                </label>
                <input
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  required
                  placeholder="e.g. Cohere"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
                  Website URL *
                </label>
                <input
                  value={websiteUrl}
                  onChange={e => setWebsiteUrl(e.target.value)}
                  required
                  placeholder="e.g. cohere.com"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
                />
              </div>

              {companyResult && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: companyResult.ok ? 'rgba(0, 200, 100, 0.1)' : 'rgba(255, 80, 80, 0.1)',
                  border: `1px solid ${companyResult.ok ? '#00c864' : '#ff5050'}`,
                  fontSize: '14px',
                  color: companyResult.ok ? '#00c864' : '#ff5050',
                }}>
                  {companyResult.ok ? (
                    <>
                      {companyName} community created.{' '}
                      <Link href={`/c/${companyResult.communitySlug}`} style={{ color: '#00c864', textDecoration: 'underline' }}>
                        View community →
                      </Link>
                    </>
                  ) : companyResult.error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button
                  type="submit"
                  disabled={companyLoading || !companyName.trim() || !websiteUrl.trim()}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: companyName.trim() && websiteUrl.trim() ? '#FFFFFF' : '#343536',
                    border: 'none',
                    borderRadius: '20px',
                    color: companyName.trim() && websiteUrl.trim() ? '#0D0D0D' : '#818384',
                    fontSize: '14px',
                    fontWeight: 400,
                    cursor: companyName.trim() && websiteUrl.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  {companyLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}

          {/* Subcommunity tab */}
          {tab === 'Sub-community' && (
            <form onSubmit={handleSubSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
                  Parent community *
                </label>
                <CommunityPicker
                  communities={parentCommunities as PickerCommunity[]}
                  defaultSlug={parentCommunitySlug}
                  name="parentCommunitySlug"
                  onChange={setParentCommunitySlug}
                  fullWidth
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#818384', marginBottom: '6px' }}>
                  Sub-community name *
                </label>
                <input
                  value={subCommunityName}
                  onChange={e => setSubCommunityName(e.target.value)}
                  required
                  placeholder="e.g. SWE, PM, Design"
                  style={inputStyle}
                  onFocus={e => { e.currentTarget.style.borderColor = '#D7DADC' }}
                  onBlur={e => { e.currentTarget.style.borderColor = '#343536' }}
                />
              </div>

              {subResult && (
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: subResult.ok ? 'rgba(0, 200, 100, 0.1)' : 'rgba(255, 80, 80, 0.1)',
                  border: `1px solid ${subResult.ok ? '#00c864' : '#ff5050'}`,
                  fontSize: '14px',
                  color: subResult.ok ? '#00c864' : '#ff5050',
                }}>
                  {subResult.ok ? (
                    <>
                      {parentCommunities.find(c => c.slug === parentCommunitySlug)?.name} / {subCommunityName} community created.{' '}
                      <Link href={`/c/${subResult.communitySlug}`} style={{ color: '#00c864', textDecoration: 'underline' }}>
                        View community →
                      </Link>
                    </>
                  ) : subResult.error}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                <button
                  type="submit"
                  disabled={subLoading || !parentCommunitySlug || !subCommunityName.trim()}
                  style={{
                    padding: '8px 20px',
                    backgroundColor: parentCommunitySlug && subCommunityName.trim() ? '#FFFFFF' : '#343536',
                    border: 'none',
                    borderRadius: '20px',
                    color: parentCommunitySlug && subCommunityName.trim() ? '#0D0D0D' : '#818384',
                    fontSize: '14px',
                    fontWeight: 400,
                    cursor: parentCommunitySlug && subCommunityName.trim() ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                  }}
                >
                  {subLoading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
