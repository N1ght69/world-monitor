import React, { useEffect } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
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

const CHANNEL_LIST = [
  'DW English', 'DW Deutsch', 'DW Español', 'DW عربي', 'Euronews',
]

function ResizeHandleV() {
  return <PanelResizeHandle className="resize-handle-v" />
}
function ResizeHandleH() {
  return <PanelResizeHandle className="resize-handle-h" />
}

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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <TopBar />

      <PanelGroup direction="vertical" style={{ flex: 1, minHeight: 0 }}>
        {/* Middle: Sidebar | Map/Globe | News+AI */}
        <Panel defaultSize={72} minSize={40}>
          <PanelGroup direction="horizontal" style={{ height: '100%' }}>
            <Panel defaultSize={15} minSize={8} maxSize={30}>
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <LayerSidebar />
              </div>
            </Panel>
            <ResizeHandleV />
            <Panel defaultSize={55} minSize={20}>
              <div style={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                {!is3D && <MapView />}
                {is3D  && <GlobeView />}
              </div>
            </Panel>
            <ResizeHandleV />
            <Panel defaultSize={30} minSize={15}>
              <PanelGroup direction="vertical" style={{ height: '100%' }}>
                <Panel defaultSize={60} minSize={20}>
                  <div style={{ height: '100%', overflow: 'hidden' }}>
                    <NewsFeed />
                  </div>
                </Panel>
                <ResizeHandleH />
                <Panel defaultSize={40} minSize={15}>
                  <div style={{ height: '100%', overflow: 'hidden' }}>
                    <AIBriefing />
                  </div>
                </Panel>
              </PanelGroup>
            </Panel>
          </PanelGroup>
        </Panel>

        <ResizeHandleH />

        {/* Bottom: StreamsBar | Channel list */}
        <Panel defaultSize={28} minSize={15} maxSize={50}>
          <PanelGroup direction="horizontal" style={{ height: '100%' }}>
            <Panel defaultSize={75} minSize={40}>
              <div style={{ height: '100%', overflow: 'hidden' }}>
                <StreamsBar />
              </div>
            </Panel>
            <ResizeHandleV />
            <Panel defaultSize={25} minSize={10}>
              <div style={{ height: '100%', background: 'var(--panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1 }}>CHANNELS</span>
                  <span style={{ fontSize: 9, color: 'var(--red)', fontFamily: 'var(--mono)', background: 'rgba(248,81,73,0.15)', borderRadius: 3, padding: '1px 6px' }}>● LIVE</span>
                </div>
                <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
                  {CHANNEL_LIST.map((name) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 12px', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 10, fontFamily: 'var(--mono)', color: 'var(--text2)' }}>{name}</span>
                      <span style={{ fontSize: 8, color: 'var(--red)' }}>●</span>
                    </div>
                  ))}
                </div>
              </div>
            </Panel>
          </PanelGroup>
        </Panel>
      </PanelGroup>
    </div>
  )
}
