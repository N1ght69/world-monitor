import React from 'react'

const STREAMS = [
  { id: 'dw',        name: 'DW English', embed: 'https://www.dw.com/en/media-center/live-tv/stream-tv-channel/s-100825' },
  { id: 'aljazeera', name: 'Al Jazeera', embed: 'https://www.aljazeera.com/live/' },
  { id: 'france24',  name: 'France 24',  embed: 'https://www.france24.com/en/live-news/' },
  { id: 'euronews',  name: 'Euronews',   embed: 'https://www.euronews.com/live' },
  { id: 'nasa',      name: 'NASA TV',    embed: 'https://www.nasa.gov/nasatv/' },
]

export default function StreamsBar() {
  const [main, ...rest] = STREAMS

  return (
    <div style={{ height: 200, background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>LIVE STREAMS</span>
        <span style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(248,81,73,0.15)', borderRadius: 3, padding: '1px 6px', animation: 'blink 1.2s steps(1) infinite' }}>● LIVE</span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', gap: 1, background: 'var(--border)', overflow: 'hidden' }}>
        {/* Main stream — 60% */}
        <div style={{ flex: '0 0 60%', position: 'relative', background: '#000' }}>
          <iframe
            src={main.embed}
            allow="autoplay; fullscreen"
            style={{ border: 'none', width: '100%', height: '100%' }}
          />
          <div style={{ position: 'absolute', bottom: 4, left: 6, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
            {main.name}
          </div>
        </div>

        {/* 2×2 grid — 40% */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, background: 'var(--border)' }}>
          {rest.map((s) => (
            <div key={s.id} style={{ position: 'relative', background: '#000', overflow: 'hidden' }}>
              <iframe
                src={s.embed}
                allow="autoplay; fullscreen"
                style={{ border: 'none', width: '100%', height: '100%' }}
              />
              <div style={{ position: 'absolute', bottom: 3, left: 5, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 8, fontWeight: 600, padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
                {s.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
