import React, { useState } from 'react';

const STREAMS = [
  { name: 'Al Jazeera English', short: 'AJE',  channel: 'aje'  },
  { name: 'Bloomberg TV',       short: 'BBG',  channel: 'bbg'  },
  { name: 'DW News',            short: 'DW',   channel: 'dw'   },
  { name: 'Sky News',           short: 'SKY',  channel: 'sky'  },
  { name: 'France 24',          short: 'F24',  channel: 'f24'  },
  { name: 'Euronews',           short: 'EUR',  channel: 'eur'  },
  { name: 'CNN International',  short: 'CNN',  channel: 'cnn'  },
  { name: 'WION',               short: 'WION', channel: 'wion' },
];

export default function StreamsBar() {
  const [current, setCurrent] = useState(0);
  const [muted, setMuted] = useState(true);
  // key forces iframe reload when channel or mute changes
  const [key, setKey] = useState(0);

  const switchTo = (idx) => { setCurrent(idx); setKey((k) => k + 1); };
  const toggleMute = () => { setMuted((m) => !m); setKey((k) => k + 1); };

  const src = `/api/stream/${STREAMS[current].channel}${muted ? '' : '?mute=0'}`;

  return (
    <div style={{ height: 200, background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>LIVE STREAMS</span>
          <span style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(248,81,73,0.15)', borderRadius: 3, padding: '1px 6px', animation: 'blink 1.2s steps(1) infinite' }}>● LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {STREAMS.map((s, i) => (
            <button key={s.short} onClick={() => switchTo(i)} style={{
              background: i === current ? 'var(--blue)' : 'var(--panel2)',
              border: '1px solid var(--border)',
              color: i === current ? '#fff' : 'var(--text3)',
              padding: '2px 7px', borderRadius: 3, fontSize: 9, fontWeight: 600,
              fontFamily: 'var(--mono)', cursor: 'pointer',
            }}>{s.short}</button>
          ))}
        </div>
        <button onClick={toggleMute} style={{ background: 'var(--panel2)', border: '1px solid var(--border)', color: muted ? 'var(--text2)' : 'var(--accent)', padding: '2px 8px', borderRadius: 3, fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          {muted ? '🔇 Muted' : '🔊 Live'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', gap: 1, background: 'var(--border)', overflow: 'hidden' }}>
        {/* Main player */}
        <div style={{ flex: 3, position: 'relative', background: '#000' }}>
          <iframe key={key} src={src}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture;web-share"
            allowFullScreen />
          <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
            {STREAMS[current].name}
          </div>
        </div>

        {/* Thumbnails */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
          {STREAMS.slice(1, 5).map((s, i) => (
            <div key={s.short} onClick={() => switchTo(i + 1)} style={{ flex: 1, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#141414'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{s.short}</span>
              <span style={{ position: 'absolute', right: 6, fontSize: 8, color: 'var(--red)' }}>● LIVE</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
