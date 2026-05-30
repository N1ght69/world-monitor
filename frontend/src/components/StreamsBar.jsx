import React, { useEffect, useRef, useState } from 'react'
import Hls from 'hls.js'

const STREAMS = [
  { id: 'dw_en', name: 'DW English', url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
  { id: 'dw_de', name: 'DW Deutsch', url: 'https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8' },
  { id: 'dw_es', name: 'DW Español', url: 'https://dwamdstream105.akamaized.net/hls/live/2015531/dwstream105/index.m3u8' },
  { id: 'dw_ar', name: 'DW عربي',    url: 'https://dwamdstream106.akamaized.net/hls/live/2015532/dwstream106/index.m3u8' },
  { id: 'dw_bn', name: 'DW हिन्दी',  url: 'https://dwamdstream107.akamaized.net/hls/live/2015533/dwstream107/index.m3u8' },
]

function StreamCell({ stream, style }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setError(false)

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(stream.url)
      hls.attachMedia(video)
      hls.on(Hls.Events.ERROR, (_, data) => { if (data.fatal) setError(true) })
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream.url
    } else {
      setError(true)
    }

    return () => {
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [stream.url])

  return (
    <div style={{ position: 'relative', background: '#000', overflow: 'hidden', height: '100%', ...style }}>
      {error ? (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080808' }}>
          <span style={{ color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)' }}>{stream.name}</span>
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
      <div style={{ position: 'absolute', bottom: 4, left: 6, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '1px 6px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
        {stream.name}
      </div>
    </div>
  )
}

export default function StreamsBar() {
  const [main, ...rest] = STREAMS

  return (
    <div style={{ height: 220, maxHeight: 220, background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>LIVE STREAMS</span>
        <span style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(248,81,73,0.15)', borderRadius: 3, padding: '1px 6px', animation: 'blink 1.2s steps(1) infinite' }}>● LIVE</span>
      </div>

      {/* Grid */}
      <div style={{ flex: 1, display: 'flex', gap: 1, background: 'var(--border)', overflow: 'hidden', minHeight: 0 }}>
        {/* Main — 60% */}
        <StreamCell stream={main} style={{ flex: '0 0 60%' }} />

        {/* 2×2 grid — 40% */}
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 1, background: 'var(--border)', minHeight: 0 }}>
          {rest.map((s) => (
            <StreamCell key={s.id} stream={s} style={{}} />
          ))}
        </div>
      </div>
    </div>
  )
}
