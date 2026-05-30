import React from 'react';
import useStore from '../store';

const CATS = ['all', 'conflict', 'markets', 'energy', 'geo'];

const BADGE = {
  conflict: 'badge-red',
  markets:  'badge-blue',
  energy:   'badge-yellow',
  geo:      'badge-orange',
};

export default function NewsPanel() {
  const news = useStore((s) => s.news);
  const newsFilter = useStore((s) => s.newsFilter);
  const setFilter = useStore((s) => s.setFilter);

  const visible = newsFilter === 'all' ? news : news.filter((a) => a.category === newsFilter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          LIVE NEWS
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', background: 'rgba(35,134,54,0.15)', borderRadius: 3, padding: '1px 5px' }}>
            {visible.length}
          </span>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.2s steps(1) infinite' }} />
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: 'flex', padding: '5px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto', gap: 0 }}>
        {CATS.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            background: newsFilter === cat ? 'var(--blue)' : 'transparent',
            border: 'none',
            color: newsFilter === cat ? '#fff' : 'var(--text3)',
            padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.5, whiteSpace: 'nowrap', fontFamily: 'var(--font)',
            transition: 'all 0.1s',
          }}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Articles */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.length === 0 && (
          <div style={{ padding: 16, color: 'var(--text3)', fontSize: 11, textAlign: 'center' }}>
            No articles. Backend fetches every 2 min.
          </div>
        )}
        {visible.map((a, i) => (
          <div key={i}
            className={a.breaking ? 'news-item breaking' : 'news-item'}
            style={{ padding: '9px 10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s', ...(a.breaking ? { borderLeft: '2px solid var(--red)', background: 'rgba(248,81,73,0.04)' } : {}) }}
            onClick={() => a.url && window.open(a.url, '_blank')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)' }}>{a.source}</span>
              <span className={`ni-badge ${BADGE[a.category] || 'badge-blue'}`} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, padding: '1px 5px', borderRadius: 2, textTransform: 'uppercase' }}>
                {a.category}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginLeft: 'auto' }}>
                {a.published_at ? new Date(a.published_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>{a.headline}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
