import React, { useState, useRef, useEffect } from 'react'
import Hls from 'hls.js'

const STREAMS = [
  { id: 'arte',      name: 'ARTE',        url: 'https://artesimulcast.akamaized.net/hls/live/2031003/artelive_en/index.m3u8' },
  { id: 'nasa',      name: 'NASA TV',     url: 'https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-HLS/master.m3u8' },
  { id: 'euronews',  name: 'Euronews EN', url: 'https://euronews-euronews-world-1-eu.rakuten.wurl.tv/playlist.m3u8' },
  { id: 'bloomberg', name: 'Bloomberg',   url: 'https://bloomberg-bloomberg-1-us.samsung.wurl.tv/playlist.m3u8' },
  { id: 'dw',        name: 'DW English',  url: 'https://dwamdstream102.akamaized.net/hls/live/2015525/dwstream102/index.m3u8' },
]

export default function StreamsBar() {
  const [current, setCurrent] = useState(0)
  const [muted, setMuted] = useState(true)
  const videoRef = useRef(null)
  const hlsRef = useRef(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    const url = STREAMS[current].url

    if (Hls.isSupported()) {
      const hls = new Hls()
      hls.loadSource(url)
      hls.attachMedia(video)
      hlsRef.current = hls
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [current])

  const thumbnails = STREAMS.map((s, i) => ({ ...s, idx: i })).filter((_, i) => i !== current).slice(0, 4)

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
            <button key={s.id} onClick={() => setCurrent(i)} style={{
              background: i === current ? 'var(--blue)' : 'var(--panel2)',
              border: '1px solid var(--border)',
              color: i === current ? '#fff' : 'var(--text3)',
              padding: '2px 7px', borderRadius: 3, fontSize: 9, fontWeight: 600,
              fontFamily: 'var(--mono)', cursor: 'pointer',
            }}>{s.name}</button>
          ))}
        </div>
        <button onClick={() => setMuted(m => !m)} style={{ background: 'var(--panel2)', border: '1px solid var(--border)', color: muted ? 'var(--text2)' : 'var(--accent)', padding: '2px 8px', borderRadius: 3, fontSize: 10, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          {muted ? '🔇 Muted' : '🔊 Live'}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', gap: 1, background: 'var(--border)', overflow: 'hidden' }}>
        {/* Main player */}
        <div style={{ flex: 3, position: 'relative', background: '#000' }}>
          <video
            ref={videoRef}
            muted={muted}
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: 6, left: 8, background: 'rgba(0,0,0,0.75)', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 3, fontFamily: 'var(--mono)', pointerEvents: 'none' }}>
            {STREAMS[current].name}
          </div>
        </div>

        {/* Thumbnails */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1, background: 'var(--border)' }}>
          {thumbnails.map((s) => (
            <div key={s.id} onClick={() => setCurrent(s.idx)} style={{ flex: 1, background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', borderBottom: '1px solid var(--border)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#141414'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0a0a0a'}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text2)', fontFamily: 'var(--mono)' }}>{s.name}</span>
              <span style={{ position: 'absolute', right: 6, fontSize: 8, color: 'var(--red)' }}>● LIVE</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
