'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CommunityRequest {
  id: string
  type: string
  companyName: string
  websiteUrl: string
  parentCommunitySlug: string | null
  subCommunityName: string | null
  status: string
  resultCommunitySlug: string | null
  createdAt: string
}

export default function CommunityRequestsPage() {
  const [requests, setRequests] = useState<CommunityRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/community-requests')
      .then(r => r.json())
      .then(data => { setRequests(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Link
          href="/admin"
          style={{ fontSize: '13px', color: '#818384', textDecoration: 'none' }}
        >
          ← Back to admin
        </Link>
      </div>

      <h2 style={{ fontSize: '16px', fontWeight: 500, color: '#D7DADC', marginBottom: '16px' }}>
        Community Requests ({requests.length})
      </h2>

      {loading && (
        <p style={{ color: '#818384', fontSize: '14px' }}>Loading...</p>
      )}

      {!loading && requests.length === 0 && (
        <p style={{ color: '#818384', fontSize: '14px', textAlign: 'center', padding: '32px 0' }}>
          No community requests yet.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {requests.map(req => (
          <div
            key={req.id}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '1px solid #1e1f20',
              borderRadius: '0',
              padding: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Type badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: req.type === 'COMPANY' ? 'rgba(0, 100, 255, 0.2)' : 'rgba(140, 0, 255, 0.2)',
                  color: req.type === 'COMPANY' ? '#6699ff' : '#cc88ff',
                  border: `1px solid ${req.type === 'COMPANY' ? 'rgba(0, 100, 255, 0.4)' : 'rgba(140, 0, 255, 0.4)'}`,
                }}>
                  {req.type === 'COMPANY' ? 'COMPANY' : 'SUBCOMMUNITY'}
                </span>

                {/* Status badge */}
                <span style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: req.status === 'APPROVED' ? 'rgba(0, 200, 80, 0.15)' : 'rgba(255, 200, 0, 0.15)',
                  color: req.status === 'APPROVED' ? '#00c850' : '#ffc800',
                  border: `1px solid ${req.status === 'APPROVED' ? 'rgba(0, 200, 80, 0.3)' : 'rgba(255, 200, 0, 0.3)'}`,
                }}>
                  {req.status}
                </span>
              </div>

              <span style={{ fontSize: '12px', color: '#818384' }}>
                {new Date(req.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </span>
            </div>

            <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '15px', color: '#D7DADC', fontWeight: 400 }}>
                {req.type === 'SUBCOMMUNITY' && req.subCommunityName
                  ? `${req.companyName} / ${req.subCommunityName}`
                  : req.companyName}
              </div>

              {req.websiteUrl && (
                <div style={{ marginTop: '4px', fontSize: '13px', color: '#818384' }}>
                  {req.websiteUrl}
                </div>
              )}

              {req.resultCommunitySlug && (
                <div style={{ marginTop: '8px' }}>
                  <Link
                    href={`/c/${req.resultCommunitySlug}`}
                    style={{ fontSize: '13px', color: '#6699ff', textDecoration: 'none' }}
                  >
                    /c/{req.resultCommunitySlug} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
