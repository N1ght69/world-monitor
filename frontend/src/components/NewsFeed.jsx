import React from 'react';
import useStore from '../store';

const CATS = ['all', 'conflict', 'markets', 'energy', 'geo'];
const BADGE_CLASS = { conflict: 'badge-red', markets: 'badge-blue', energy: 'badge-yellow', geo: 'badge-orange' };

function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function NewsFeed() {
  const news       = useStore((s) => s.news);
  const newsFilter = useStore((s) => s.newsFilter);
  const setFilter  = useStore((s) => s.setFilter);

  const visible = newsFilter === 'all' ? news : news.filter((a) => a.category === newsFilter);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>LIVE NEWS</span>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--accent)', background: 'rgba(35,134,54,0.15)', borderRadius: 3, padding: '1px 5px' }}>{visible.length}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'blink 1.2s steps(1) infinite' }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', padding: '5px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0, overflowX: 'auto' }}>
        {CATS.map((cat) => (
          <button key={cat} onClick={() => setFilter(cat)} style={{
            background: newsFilter === cat ? 'var(--blue)' : 'transparent',
            border: 'none', color: newsFilter === cat ? '#fff' : 'var(--text3)',
            padding: '3px 8px', borderRadius: 3, fontSize: 10, fontWeight: 600,
            cursor: 'pointer', letterSpacing: 0.5, whiteSpace: 'nowrap', fontFamily: 'var(--font)',
          }}>
            {cat.toUpperCase()}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {visible.length === 0 && (
          <div style={{ padding: 16, color: 'var(--text3)', fontSize: 11, textAlign: 'center' }}>
            No articles — backend fetches every 2 min.
          </div>
        )}
        {visible.map((a, i) => (
          <div key={i} style={{
            padding: '9px 10px', borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s',
            ...(a.breaking ? { borderLeft: '2px solid var(--red)', background: 'rgba(248,81,73,0.04)' } : {}),
          }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--panel2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = a.breaking ? 'rgba(248,81,73,0.04)' : ''}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--blue)' }}>{a.source}</span>
              <span className={BADGE_CLASS[a.category] || 'badge-blue'} style={{ fontSize: 8, fontWeight: 700, letterSpacing: 1, padding: '1px 5px', borderRadius: 2, textTransform: 'uppercase' }}>
                {a.category}
              </span>
              <span style={{ fontFamily: 'var(--mono)', fontSize: 9, color: 'var(--text3)', marginLeft: 'auto' }}>
                {timeAgo(a.published_at)}
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text)', lineHeight: 1.5 }}>
              {a.url
                ? <a href={a.url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}
                    onMouseEnter={(e) => e.target.style.color = 'var(--blue)'}
                    onMouseLeave={(e) => e.target.style.color = 'inherit'}>{a.headline}</a>
                : a.headline}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
