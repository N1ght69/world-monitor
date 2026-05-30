import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function Ticker() {
  const [markets, setMarkets] = useState([]);

  useEffect(() => {
    const fetch = () => axios.get('/api/markets').then(r => setMarkets(r.data)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, []);

  if (!markets.length) return null;

  const items = [...markets, ...markets];

  return (
    <div style={{ height: 26, background: '#1c2330', borderTop: '1px solid #30363d', display: 'flex', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ background: '#1f6feb', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
        MKTS
      </div>
      <div style={{ overflow: 'hidden', flex: 1 }}>
        <div style={{ display: 'inline-flex', animation: 'ticker 60s linear infinite', whiteSpace: 'nowrap' }}>
          {items.map((m, i) => (
            <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 16px', fontFamily: 'monospace', fontSize: 10, borderRight: '1px solid #30363d' }}>
              <span style={{ color: '#484f58' }}>{m.symbol}</span>
              <span style={{ color: '#e6edf3' }}>{m.value}</span>
              <span style={{ color: m.up ? '#56d364' : '#f85149' }}>{m.up ? '+' : ''}{m.change}%</span>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
    </div>
  );
}
