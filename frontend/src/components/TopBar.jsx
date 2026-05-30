import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import useStore from '../store';

const DAYS = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
const pad = (v) => String(v).padStart(2, '0');

const REGIONS = [
  { name: 'WORLD',        latlng: [20, 15],  zoom: 3 },
  { name: 'EUROPE',       latlng: [54, 15],  zoom: 4 },
  { name: 'MIDDLE EAST',  latlng: [27, 42],  zoom: 5 },
  { name: 'ASIA-PACIFIC', latlng: [20, 115], zoom: 4 },
  { name: 'AMERICAS',     latlng: [15, -80], zoom: 3 },
  { name: 'AFRICA',       latlng: [5,   20], zoom: 4 },
];

const DC_COLORS = { 1:'#f85149', 2:'#f85149', 3:'#e3703a', 4:'#d29922', 5:'#1f6feb' };

export default function TopBar() {
  const [time, setTime] = useState('');
  const [ddOpen, setDdOpen] = useState(false);
  const ddRef = useRef(null);

  const defcon       = useStore((s) => s.defcon);
  const setDefcon    = useStore((s) => s.setDefcon);
  const is3D         = useStore((s) => s.is3D);
  const setIs3D      = useStore((s) => s.setIs3D);
  const currentRegion= useStore((s) => s.currentRegion);
  const setRegion    = useStore((s) => s.setRegion);
  const marketData   = useStore((s) => s.marketData);
  const setMarketData= useStore((s) => s.setMarketData);
  const setSearchQuery=useStore((s) => s.setSearchQuery);

  // Clock
  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setTime(`${DAYS[n.getUTCDay()]}, ${pad(n.getUTCDate())} ${MONTHS[n.getUTCMonth()]} ${n.getUTCFullYear()} ${pad(n.getUTCHours())}:${pad(n.getUTCMinutes())}:${pad(n.getUTCSeconds())} UTC`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Markets
  useEffect(() => {
    const fetch = () => axios.get('/api/markets').then((r) => setMarketData(r.data)).catch(() => {});
    fetch();
    const id = setInterval(fetch, 60000);
    return () => clearInterval(id);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ddRef.current && !ddRef.current.contains(e.target)) setDdOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dcColor = DC_COLORS[defcon] || '#1f6feb';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
      {/* Main bar */}
      <div style={{ height: 38, background: 'var(--panel)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 0, position: 'relative', zIndex: 1000 }}>
        <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: 0.5, padding: '0 12px', borderRight: '1px solid var(--border)', marginRight: 8 }}>
          WORLD <span style={{ color: 'var(--accent)' }}>MONITOR</span>
        </div>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)', marginRight: 12 }}>v4.0.0</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.2s steps(1) infinite' }} />
          LIVE
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

        {/* Search */}
        <input
          type="text"
          placeholder="Search events..."
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
          onKeyDown={(e) => { if (e.key === 'Escape') { e.target.value = ''; setSearchQuery(''); } }}
          style={{ background: 'var(--panel2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 10px', borderRadius: 4, fontSize: 11, width: 170, fontFamily: 'var(--font)', outline: 'none' }}
        />

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

        {/* DEFCON */}
        <div onClick={() => setDefcon(defcon > 1 ? defcon - 1 : 5)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: `rgba(${defcon <= 2 ? '248,81,73' : defcon === 3 ? '227,112,58' : defcon === 4 ? '210,153,34' : '31,111,235'},0.15)`, border: `1px solid ${dcColor}66`, borderRadius: 4, padding: '3px 10px', cursor: 'pointer', userSelect: 'none' }}>
          <span style={{ fontSize: 10, color: dcColor, letterSpacing: 1 }}>DEFCON</span>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 500, color: dcColor }}>{defcon}</span>
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

        {/* 2D / 3D */}
        <button className={`tb-btn${!is3D ? ' active' : ''}`} onClick={() => setIs3D(false)}>2D</button>
        <button className={`tb-btn${is3D ? ' active' : ''}`} onClick={() => setIs3D(true)}>3D</button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />

        {/* Region dropdown */}
        <div ref={ddRef} style={{ position: 'relative' }}>
          <button className="tb-btn active" onClick={() => setDdOpen((v) => !v)}>
            {currentRegion === 'WORLD' ? '🌍 ' : ''}{currentRegion} ▾
          </button>
          {ddOpen && (
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 4, zIndex: 2000, minWidth: 140, overflow: 'hidden' }}>
              {REGIONS.map((r) => (
                <div key={r.name}
                  onClick={() => { setRegion(r.name); setDdOpen(false); }}
                  style={{ padding: '6px 14px', fontSize: 11, cursor: 'pointer', color: 'var(--text2)', whiteSpace: 'nowrap' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel2)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = ''}>
                  {r.name === 'WORLD' ? '🌍 ' : ''}{r.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 8px' }} />
        <button className="tb-btn" onClick={() => window.dispatchEvent(new CustomEvent('map:reset'))}>Reset View</button>

        <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--text2)', marginLeft: 'auto' }}>{time}</div>
      </div>

      {/* Ticker strip */}
      {marketData.length > 0 && (
        <div style={{ height: 24, background: 'var(--panel2)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', overflow: 'hidden', flexShrink: 0 }}>
          <div style={{ background: 'var(--blue)', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: 2, padding: '0 10px', height: '100%', display: 'flex', alignItems: 'center', flexShrink: 0 }}>MKTS</div>
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ display: 'inline-flex', animation: 'ticker-anim 50s linear infinite', whiteSpace: 'nowrap' }}>
              {[...marketData, ...marketData].map((m, i) => (
                <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '0 14px', fontFamily: 'var(--mono)', fontSize: 10, borderRight: '1px solid var(--border)' }}>
                  <span style={{ color: 'var(--text3)' }}>{m.symbol || m.s}</span>
                  <span style={{ color: 'var(--text)' }}>{m.value || m.v}</span>
                  <span style={{ color: m.up ? 'var(--cyan)' : 'var(--red)' }}>{m.change || m.c}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
