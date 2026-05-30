import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const STREAMS = [
  { id: 'dw_en', name: 'DW English', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
  { id: 'dw_de', name: 'DW Deutsch', url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8' },
  { id: 'dw_es', name: 'DW Español', url: 'https://dwamdstream105.akamaized.net/hls/live/2015531/dwstream105/index.m3u8' },
  { id: 'dw_ar', name: 'DW عربي',    url: 'https://dwamdstream106.akamaized.net/hls/live/2015532/dwstream106/index.m3u8' },
  { id: 'euronews', name: 'Euronews', url: 'https://euronews-euronews-world-1-eu.rakuten.wurl.tv/playlist.m3u8' },
]

export default function StreamsBar() {
  const [current, setCurrent] = useState(0)
  const [error, setError] = useState(false)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    setError(false)

    const url = STREAMS[current].url

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setError(true) })
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
    } else {
      setError(true)
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [current])

  return (
    <div style={{ height: '100%', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>LIVE STREAMS</span>
          <span style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(248,81,73,0.15)', borderRadius: 3, padding: '1px 6px', animation: 'blink 1.2s steps(1) infinite' }}>● LIVE</span>
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {STREAMS.map((s, i) => (
            <button key={s.id} onClick={() => setCurrent(i)} style={{
              background: i === current ? 'var(--blue)' : 'var(--panel2)',
              border: '1px solid var(--border)',
              color: i === current ? '#fff' : 'var(--text3)',
              padding: '2px 8px', borderRadius: 3, fontSize: 9, fontWeight: 600,
              fontFamily: 'var(--mono)', cursor: 'pointer', whiteSpace: 'nowrap',
            }}>{s.name}</button>
          ))}
        </div>
      </div>

      {/* Player */}
      <div style={{ flex: 1, position: 'relative', background: '#000', minHeight: 0 }}>
        {error ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
            <span style={{ color: 'var(--text3)', fontSize: 11, fontFamily: 'var(--mono)' }}>{STREAMS[current].name}</span>
          </div>
        ) : (
          <video
            ref={videoRef}
            muted
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
          />
        )}
        <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
          {STREAMS[current].name}
        </div>
      </div>
    </div>
  )
}
