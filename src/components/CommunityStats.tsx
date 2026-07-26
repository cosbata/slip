interface StageRow { stage: string | null; cnt: unknown }
interface OutcomeRow { category: string | null; cnt: unknown }

const STAGE_LABELS: Record<string, string> = {
  SCREEN: 'Resume Screen', PHONE: 'Phone', ONSITE: 'Onsite',
  FINAL: 'Final Round', OFFER_RESCINDED: 'Offer Rescinded',
}
const OUTCOME_LABELS: Record<string, string> = {
  HIRED_ELSEWHERE: 'Hired elsewhere', RAISED_FUNDING: 'Raised funding',
  STARTED_COMPANY: 'Started company', JOINED_PROGRAM: 'Joined program',
  STILL_SEARCHING: 'Still searching', PIVOTED_CAREERS: 'Pivoted', OTHER: 'Other',
}

export function CommunityStats({
  stageData, outcomeData, label, totalStories,
}: {
  stageData: StageRow[]
  outcomeData: OutcomeRow[]
  label: string
  totalStories: number
}) {
  const stageTotal = stageData.reduce((s, r) => s + Number(r.cnt), 0)
  const outcomeTotal = outcomeData.reduce((s, r) => s + Number(r.cnt), 0)

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">{label}</p>

      {stageData.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2">Rejection stage</h4>
          <div className="space-y-1.5">
            {stageData.map(row => {
              const pct = stageTotal > 0 ? Math.round((Number(row.cnt) / stageTotal) * 100) : 0
              return (
                <div key={row.stage}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>{STAGE_LABELS[row.stage ?? ''] ?? row.stage}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {outcomeData.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide mb-2">What happened after</h4>
          <div className="space-y-1.5">
            {outcomeData.map(row => {
              const pct = outcomeTotal > 0 ? Math.round((Number(row.cnt) / outcomeTotal) * 100) : 0
              return (
                <div key={row.category}>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>{OUTCOME_LABELS[row.category ?? ''] ?? row.category}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
