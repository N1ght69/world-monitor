import React, { useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import useStore from './store';
import TopBar from './components/TopBar';
import LayerSidebar from './components/LayerSidebar';
import MapView from './components/MapView';
import GlobeView from './components/GlobeView';
import RightPanel from './components/RightPanel';
import StreamsBar from './components/StreamsBar';

let socket = null;

export default function App() {
  const setEvents = useStore((s) => s.setEvents);
  const addNews   = useStore((s) => s.addNews);
  const is3D      = useStore((s) => s.is3D);

  useEffect(() => {
    axios.get('/api/events').then((r) => setEvents(r.data)).catch(console.error);
    axios.get('/api/news').then((r) => addNews(r.data)).catch(console.error);

    socket = io({ transports: ['websocket', 'polling'] });
    socket.on('news:update', (articles) => addNews(articles));

    return () => socket?.disconnect();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      {/* TopBar (38px main + optional 24px ticker) */}
      <TopBar />

      {/* Middle: Sidebar | Map/Globe | RightPanel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <LayerSidebar />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {!is3D && <MapView />}
          {is3D  && <GlobeView />}
        </div>
        <RightPanel />
      </div>

      {/* StreamsBar */}
      <StreamsBar />
    </div>
  );
}
