import { HomeUserCard } from '@/components/HomeUserCard'
import { NewsWidget } from '@/components/NewsWidget'

export async function LeftSidebar() {
  return (
    <nav
      className="left-sidebar"
      style={{
        width: '240px',
        minWidth: '240px',
        position: 'sticky',
        top: '48px',
        height: 'calc(100vh - 48px)',
        overflowY: 'auto',
        backgroundColor: '#0D0D0D',
        borderRight: '1px solid #1e1f20',
        padding: '16px',
        boxSizing: 'border-box',
      }}
    >
      {/* User profile card */}
      <HomeUserCard />
      {/* Divider */}
      <div style={{ borderTop: '1px solid #1e1f20', margin: '16px 0' }} />
      <NewsWidget />
    </nav>
  )
}
