import React, { useEffect } from 'react'
import { io } from 'socket.io-client'
import axios from 'axios'
import useStore from './store'
import TopBar from './components/TopBar'
import Ticker from './components/Ticker'
import LayerSidebar from './components/LayerSidebar'
import MapView from './components/MapView'
import GlobeView from './components/GlobeView'
import NewsFeed from './components/NewsFeed'
import AIBriefing from './components/AIBriefing'
import StreamsBar from './components/StreamsBar'

let socket = null

export default function App() {
  const setEvents = useStore((s) => s.setEvents)
  const addNews   = useStore((s) => s.addNews)
  const is3D      = useStore((s) => s.is3D)

  useEffect(() => {
    axios.get('/api/events').then((r) => setEvents(r.data)).catch(console.error)
    axios.get('/api/news').then((r) => addNews(r.data)).catch(console.error)
    socket = io({ transports: ['websocket', 'polling'] })
    socket.on('news:update', (articles) => addNews(articles))
    return () => socket?.disconnect()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0d1117' }}>

      {/* 1. Top bar */}
      <div style={{ height: 40, flexShrink: 0 }}>
        <TopBar />
      </div>

      {/* 2. Ticker */}
      <div style={{ height: 32, flexShrink: 0 }}>
        <Ticker />
      </div>

      {/* 3. Middle row */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* Sidebar */}
        <div style={{ width: 160, flexShrink: 0, overflowY: 'auto' }}>
          <LayerSidebar />
        </div>

        {/* Map / Globe */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {!is3D && <MapView />}
          {is3D  && <GlobeView />}
        </div>

        {/* Right panel */}
        <div style={{ width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
            <NewsFeed />
          </div>
          <AIBriefing />
        </div>

      </div>

      {/* 4. Streams bar */}
      <div style={{ height: 220, flexShrink: 0, borderTop: '1px solid #21262d' }}>
        <StreamsBar />
      </div>

    </div>
  )
}
