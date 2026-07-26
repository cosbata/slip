import Link from 'next/link'
import { TrustExplainer } from '@/components/TrustExplainer'

const btnBase: React.CSSProperties = {
  display: 'block',
  width: '100%',
  textAlign: 'center',
  padding: '8px 16px',
  borderRadius: '20px',
  fontWeight: 400,
  fontSize: '14px',
  textDecoration: 'none',
  boxSizing: 'border-box',
}

export function HomeUserCard() {
  return (
    <div style={{ borderBottom: '1px solid #1e1f20', paddingBottom: '16px' }}>
      <p style={{ fontSize: '15px', color: '#D7DADC', margin: '0 0 6px', lineHeight: 1.4, fontWeight: 500 }}>
        The hiring process has receipts. Keep yours.
      </p>
      <p style={{ fontSize: '12px', color: '#818384', margin: '0 0 14px', lineHeight: 1.5 }}>
        Anonymous rejection retrospectives by company, role, and stage.
      </p>
      <TrustExplainer compact />
      <Link href="/submit" prefetch style={{ ...btnBase, backgroundColor: '#FFFFFF', color: '#0D0D0D', marginBottom: '8px' }}>
        Share your story
      </Link>
      <Link href="/login" prefetch style={{ ...btnBase, backgroundColor: 'transparent', border: '1px solid #343536', color: '#D7DADC' }}>
        Log In
      </Link>
    </div>
  )
}
