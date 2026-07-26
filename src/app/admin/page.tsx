'use client'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface Report {
  id: string
  targetType: string
  targetId: string
  category: string
  freeText: string | null
  status: string
  createdAt: string
}

const CATEGORY_LABELS: Record<string, string> = {
  SPAM: 'Spam',
  DEFAMATION: 'Defamation',
  NAMES_INDIVIDUAL: 'Names an individual',
  HARASSMENT: 'Harassment',
  NDA_VIOLATION: 'NDA violation',
  OTHER: 'Other',
}

export default function AdminPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [filter, setFilter] = useState<'PENDING' | 'REMOVED' | 'DISMISSED'>('PENDING')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/reports')
      .then(r => r.json())
      .then(data => { setReports(data); setLoading(false) })
  }, [])

  async function updateStatus(id: string, status: 'REMOVED' | 'DISMISSED') {
    await fetch('/api/reports', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r))
  }

  const filtered = reports.filter(r => r.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(['PENDING', 'REMOVED', 'DISMISSED'] as const).map(s => (
          <Button key={s} variant={filter === s ? 'default' : 'outline'}
            size="sm" onClick={() => setFilter(s)}>
            {s} ({reports.filter(r => r.status === s).length})
          </Button>
        ))}
      </div>

      {loading && <p className="text-muted-foreground">Loading...</p>}

      {!loading && filtered.length === 0 && (
        <p className="text-muted-foreground py-8 text-center">No {filter.toLowerCase()} reports.</p>
      )}

      <div className="space-y-3">
        {filtered.map(report => (
          <div key={report.id} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-muted-foreground">{report.targetType}</span>
                <span className="mx-2 text-muted-foreground">·</span>
                <span className="text-sm font-medium">{CATEGORY_LABELS[report.category] ?? report.category}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
            </div>

            {report.freeText && (
              <p className="text-sm text-muted-foreground bg-muted/30 rounded p-2">{report.freeText}</p>
            )}

            <div className="text-xs text-muted-foreground font-mono break-all">
              Target ID: {report.targetId}
            </div>

            {report.status === 'PENDING' && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" variant="destructive"
                  onClick={() => updateStatus(report.id, 'REMOVED')}>
                  Remove content
                </Button>
                <Button size="sm" variant="outline"
                  onClick={() => updateStatus(report.id, 'DISMISSED')}>
                  Dismiss
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
