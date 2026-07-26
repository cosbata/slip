import type { Metadata } from 'next'
import { IBM_Plex_Sans } from 'next/font/google'
import Link from 'next/link'
import { LeftSidebar } from '@/components/LeftSidebar'
import { SearchBar } from '@/components/SearchBar'
import { NavAuth } from '@/components/NavAuth'
import { MeProvider } from '@/components/MeProvider'

import './globals.css'

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-plex-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'slip',
  description: 'Anonymous rejection retrospectives by company, role, and stage.',
  openGraph: {
    title: 'slip — rejection is a data point',
    description: 'Anonymous rejection retrospectives. Share yours. See the patterns.',
    url: 'https://slip.wtf',
    siteName: 'slip',
    images: [{ url: 'https://slip.wtf/opengraph-image', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'slip — rejection is a data point',
    description: 'Anonymous rejection retrospectives. Share yours. See the patterns.',
    images: ['https://slip.wtf/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en" className={ibmPlexSans.variable}>
      <body style={{ backgroundColor: '#0D0D0D', margin: 0, fontFamily: 'var(--font-ibm-plex-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' }}>
        <MeProvider>
        {/* Reddit-exact top nav */}
        <header
          className="site-header"
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 999,
            backgroundColor: '#1A1A1B',
            borderBottom: '1px solid #343536',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <div
            className="site-header__inner"
            style={{
              maxWidth: '1312px',
              width: '100%',
              margin: '0 auto',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Logo */}
            <Link href="/" prefetch className="site-logo" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', flexShrink: 0 }}>
              <span style={{ color: '#FFFFFF', fontWeight: 800, fontSize: '22px', letterSpacing: '-0.5px' }}>slip</span>
            </Link>

            {/* Search */}
            <SearchBar />

            {/* Auth — hydrates after first paint so layout rendering stays fast */}
            <div
              className="site-auth"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                flexShrink: 0,
                width: '240px',
              }}
            >
              <NavAuth />
            </div>
          </div>
        </header>

        {/* 3-column shell: left nav (sticky) + main content */}
        <div className="app-shell" style={{ display: 'flex', maxWidth: '1312px', margin: '0 auto' }}>
          <LeftSidebar />
          <main className="app-main" style={{ flex: 1, minWidth: 0 }}>{children}</main>
        </div>
        </MeProvider>
      </body>
    </html>
  )
}
