import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          backgroundColor: '#0D0D0D',
          display: 'flex',
          flexDirection: 'row',
          overflow: 'hidden',
        }}
      >
        {/* Left color bar */}
        <div style={{ width: '8px', height: '100%', backgroundColor: '#FF4154', flexShrink: 0 }} />

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 72px',
          }}
        >
          {/* Top label */}
          <div style={{ fontSize: '24px', color: '#555657', fontWeight: 400, letterSpacing: '0.04em' }}>
            anonymous rejection retrospectives
          </div>

          {/* Main headline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontSize: '64px', fontWeight: 700, color: '#FFFFFF', lineHeight: 1.1 }}>
              Rejection is a data point.
            </div>
            <div style={{ fontSize: '28px', color: '#818384', fontWeight: 400, lineHeight: 1.4 }}>
              Share yours. See the patterns.
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '32px', fontSize: '20px', color: '#555657' }}>
              <span>Google</span>
              <span>YC</span>
              <span>OpenAI</span>
              <span>Datadog</span>
              <span>+ more</span>
            </div>
            <div style={{ fontSize: '32px', fontWeight: 700, color: '#FF4154', letterSpacing: '-0.02em' }}>
              slip.wtf
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
