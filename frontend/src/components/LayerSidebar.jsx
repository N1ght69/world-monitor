import React, { useState } from 'react';
import useStore from '../store';

const LAYER_META = [
  { id: 'alerts',    name: 'Intel Hotspots', icon: '🔴', color: '#f85149' },
  { id: 'conflict',  name: 'Conflict Zones',  icon: '⚔',  color: '#8957e5' },
  { id: 'military',  name: 'Military Bases',  icon: '🛡',  color: '#1f6feb' },
  { id: 'nuclear',   name: 'Nuclear Sites',   icon: '☢',  color: '#d29922' },
  { id: 'energy',    name: 'Energy Assets',   icon: '⚡',  color: '#56d364' },
  { id: 'sanctions', name: 'Sanctions',       icon: '🚫', color: '#e3703a' },
];

export default function LayerSidebar() {
  const [search, setSearch] = useState('');
  const layers     = useStore((s) => s.layers);
  const toggleLayer= useStore((s) => s.toggleLayer);
  const events     = useStore((s) => s.events);

  const counts = {};
  events.forEach((e) => { counts[e.layer] = (counts[e.layer] || 0) + 1; });

  const filtered = LAYER_META.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  const allActive = LAYER_META.every((l) => layers[l.id]);
  const toggleAll = () => {
    LAYER_META.forEach((l) => {
      if (allActive ? layers[l.id] : !layers[l.id]) toggleLayer(l.id);
    });
  };

  return (
    <div style={{ width: 200, background: 'var(--panel)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'hidden' }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>LAYERS</span>
        <button onClick={toggleAll} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', padding: '2px 7px', borderRadius: 4, fontSize: 9, cursor: 'pointer', fontFamily: 'var(--font)' }}>
          Toggle All
        </button>
      </div>

      <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--border)' }}>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search layers..."
          style={{ width: '100%', background: 'var(--panel2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '4px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font)', outline: 'none' }} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {filtered.map((l) => {
          const active = !!layers[l.id];
          const count = counts[l.id] || 0;
          return (
            <div key={l.id} onClick={() => toggleLayer(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', cursor: 'pointer', userSelect: 'none' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = ''}>
              <div style={{ width: 14, height: 14, borderRadius: 3, border: active ? 'none' : '1px solid var(--border2)', background: active ? 'var(--blue)' : 'transparent', flexShrink: 0, transition: 'all 0.1s' }} />
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, width: 16, textAlign: 'center', flexShrink: 0 }}>{l.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: active ? 'var(--text)' : 'var(--text3)', flex: 1 }}>{l.name}</span>
              {count > 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--text3)' }}>{count}</span>}
            </div>
          );
        })}
      </div>

      <div style={{ padding: '6px 10px', borderTop: '1px solid var(--border)', fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>
        © OpenStreetMap
      </div>
    </div>
  );
}
