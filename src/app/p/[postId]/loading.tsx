export default function LoadingPost() {
  return (
    <div>
      <div className="community-banner" style={{ backgroundColor: '#1A1A1B', height: '80px', width: '100%' }} />
      <div className="community-hero" style={{ backgroundColor: '#1A1A1B', borderBottom: '1px solid #343536' }}>
        <div className="community-hero__inner" style={{ maxWidth: '1072px', margin: '0 auto', padding: '0 24px' }}>
          <div className="community-hero__row" style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '12px', marginTop: '-20px' }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid #1A1A1B', backgroundColor: '#272729' }} />
            <div style={{ flex: 1, paddingBottom: '8px' }}>
              <div style={{ width: '220px', maxWidth: '60%', height: '28px', borderRadius: '6px', backgroundColor: '#272729', marginBottom: '8px' }} />
              <div style={{ width: '160px', height: '14px', borderRadius: '6px', backgroundColor: '#202123' }} />
            </div>
          </div>
        </div>
      </div>
      <div className="two-column-layout" style={{ maxWidth: '1072px', margin: '0 auto', padding: '20px 24px', display: 'flex', gap: '24px' }}>
        <main className="content-column" style={{ flex: 1, minWidth: 0, maxWidth: '690px' }}>
          <article className="post-article" style={{ borderBottom: '1px solid #1e1f20', padding: '20px 24px' }}>
            <div style={{ width: '85%', height: '24px', borderRadius: '6px', backgroundColor: '#272729', marginBottom: '14px' }} />
            <div style={{ width: '55%', height: '13px', borderRadius: '6px', backgroundColor: '#202123', marginBottom: '22px' }} />
            <div style={{ width: '100%', height: '14px', borderRadius: '6px', backgroundColor: '#202123', marginBottom: '10px' }} />
            <div style={{ width: '96%', height: '14px', borderRadius: '6px', backgroundColor: '#202123', marginBottom: '10px' }} />
            <div style={{ width: '78%', height: '14px', borderRadius: '6px', backgroundColor: '#202123' }} />
          </article>
        </main>
        <aside className="right-sidebar" style={{ width: '312px', minWidth: '312px' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid #1e1f20' }}>
            <div style={{ width: '100%', height: '14px', borderRadius: '6px', backgroundColor: '#202123', marginBottom: '10px' }} />
            <div style={{ width: '72%', height: '14px', borderRadius: '6px', backgroundColor: '#202123' }} />
          </div>
        </aside>
      </div>
    </div>
  )
}
