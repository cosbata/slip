interface TrustExplainerProps {
  compact?: boolean
}

const items = [
  'Pseudonymous by default — no real names needed.',
  'No interviewer, recruiter, or partner names.',
  'Share the process, signals, and lessons — not rumors.',
]

export function TrustExplainer({ compact = false }: TrustExplainerProps) {
  return (
    <div style={{
      border: '1px solid #2a2b2c',
      borderRadius: compact ? '8px' : '10px',
      padding: compact ? '10px 12px' : '14px 16px',
      margin: compact ? '0 0 12px' : '0 0 18px',
      backgroundColor: '#111112',
    }}>
      <p style={{
        margin: '0 0 8px',
        color: '#D7DADC',
        fontSize: compact ? '12px' : '13px',
        fontWeight: 600,
        lineHeight: 1.4,
      }}>
        Safer rejection retrospectives
      </p>
      <ul style={{
        margin: 0,
        paddingLeft: '16px',
        display: 'grid',
        gap: compact ? '4px' : '6px',
        color: '#818384',
        fontSize: compact ? '11px' : '12px',
        lineHeight: 1.45,
      }}>
        {items.map(item => <li key={item}>{item}</li>)}
      </ul>
    </div>
  )
}
