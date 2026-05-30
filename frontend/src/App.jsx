import React, { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import useStore from './store'
import TopBar from './components/TopBar'
import LayerSidebar from './components/LayerSidebar'
import MapView from './components/MapView'
import GlobeView from './components/GlobeView'
import NewsFeed from './components/NewsFeed'
import AIBriefing from './components/AIBriefing'
import StreamsBar from './components/StreamsBar'

let socket = null

function startDrag(onMove) {
  return (e) => {
    e.preventDefault()
    const move = (ev) => onMove(ev)
    const up = () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseup', up)
    }
    window.addEventListener('mousemove', move)
    window.addEventListener('mouseup', up)
  }
}

function Handle({ dir, onMouseDown }) {
  const [hover, setHover] = useState(false)
  const base = dir === 'v'
    ? { width: 4, cursor: 'col-resize', flexShrink: 0 }
    : { height: 4, cursor: 'row-resize', flexShrink: 0 }
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ ...base, background: hover ? '#4a90e2' : '#2a3142', transition: 'background 0.15s' }}
    />
  )
}

export default function App() {
  const setEvents = useStore((s) => s.setEvents)
  const addNews   = useStore((s) => s.addNews)
  const is3D      = useStore((s) => s.is3D)

  const [sidebarW,  setSidebarW]  = useState(200)
  const [rightW,    setRightW]    = useState(340)
  const [newsFeedH, setNewsFeedH] = useState(300)

  const containerRef  = useRef(null)
  const rightPanelRef = useRef(null)

  useEffect(() => {
    axios.get('/api/events').then((r) => setEvents(r.data)).catch(console.error)
    axios.get('/api/news').then((r) => addNews(r.data)).catch(console.error)
    socket = io({ transports: ['websocket', 'polling'] })
    socket.on('news:update', (articles) => addNews(articles))
    return () => socket?.disconnect()
  }, [])

  const onLeftDrag = startDrag((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setSidebarW(Math.max(120, Math.min(400, e.clientX - rect.left)))
  })

  const onRightDrag = startDrag((e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    setRightW(Math.max(200, Math.min(600, rect.right - e.clientX)))
  })

  const onRightSplitDrag = startDrag((e) => {
    if (!rightPanelRef.current) return
    const rect = rightPanelRef.current.getBoundingClientRect()
    setNewsFeedH(Math.max(80, Math.min(rect.height - 80, e.clientY - rect.top)))
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <TopBar />

      {/* Middle row */}
      <div ref={containerRef} style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        {/* Sidebar */}
        <div style={{ width: sidebarW, flexShrink: 0, overflow: 'hidden' }}>
          <LayerSidebar />
        </div>

        <Handle dir="v" onMouseDown={onLeftDrag} />

        {/* Map / Globe */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          {!is3D && <MapView />}
          {is3D  && <GlobeView />}
        </div>

        <Handle dir="v" onMouseDown={onRightDrag} />

        {/* Right panel: NewsFeed + AIBriefing */}
        <div ref={rightPanelRef} style={{ width: rightW, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ height: newsFeedH, flexShrink: 0, overflow: 'hidden' }}>
            <NewsFeed />
          </div>
          <Handle dir="h" onMouseDown={onRightSplitDrag} />
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <AIBriefing />
          </div>
        </div>
      </div>

      {/* Bottom */}
      <StreamsBar />
    </div>
  )
}
