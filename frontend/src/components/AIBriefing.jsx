import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const INITIAL = `Intelligence Briefing — ${new Date().toUTCString().slice(0, 16)} UTC

THREAT LEVEL: ELEVATED

Global risk indicators at highest since Q4 2023. Three simultaneous escalation vectors: Eastern European theater, Middle East maritime corridor, Indo-Pacific deterrence standoff.

KEY VECTORS

• Ukraine: Russian push near Kharkiv repelled but front line fluid. Ceasefire talks collapsed. NATO article 5 credibility under debate.

• Red Sea: 40% YoY increase in Houthi attacks. Brent premium at $3.80 above WTI.

• Iran: IAEA confirms 60% enrichment at Fordow. Breakout timeline 2–3 weeks.

• North Korea: Hwasong-19 ICBM preparations at Tongchangri. KPA elevated readiness.

WATCH: Iran nuclear talks (Jun 15), PLA naval exercise schedule, Fed rate decision.`;

export default function AIBriefing() {
  const [output, setOutput] = useState('');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const bodyRef = useRef(null);

  // Typewriter for initial brief
  useEffect(() => {
    let i = 0;
    const iv = setInterval(() => {
      setOutput(INITIAL.slice(0, i));
      i += 3;
      if (i > INITIAL.length) { setOutput(INITIAL); clearInterval(iv); }
    }, 8);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [output]);

  const ask = async () => {
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    setQuery('');
    setOutput(`> ${q}\n\n`);
    try {
      const res = await axios.post('/api/ai', { query: q });
      const text = res.data.text || 'Analysis unavailable.';
      let i = 0;
      const iv = setInterval(() => {
        setOutput(`> ${q}\n\n` + text.slice(0, i));
        i += 2;
        if (i > text.length) { setOutput(`> ${q}\n\n` + text); clearInterval(iv); setLoading(false); }
      }, 11);
    } catch (err) {
      setOutput(`> ${q}\n\n⚠ ${err.response?.data?.error || 'Connection error.'}`);
      setLoading(false);
    }
  };

  const formatLine = (line, i) => {
    if (!line.trim()) return <div key={i} style={{ height: 4 }}>&nbsp;</div>;
    if (line.startsWith('> ')) return <p key={i} style={{ color: '#a5f3fc', fontSize: 10, fontFamily: 'var(--mono)', marginBottom: 8, borderBottom: '1px solid var(--border)', paddingBottom: 7 }}>{line}</p>;
    if (/^[A-Z\s]+:$/.test(line.trim())) return <p key={i} style={{ color: '#a5f3fc', fontSize: 10, fontWeight: 600, letterSpacing: 1.5, margin: '10px 0 3px' }}>{line}</p>;
    if (line.startsWith('•')) return <p key={i} style={{ color: 'var(--text)', margin: '4px 0', paddingLeft: 9, borderLeft: '1px solid var(--border2)', lineHeight: 1.6, fontSize: 11 }}>{line}</p>;
    if (line.startsWith('Intelligence') || line.startsWith('WATCH:')) return <p key={i} style={{ color: 'var(--text3)', fontSize: 10, fontFamily: 'var(--mono)', marginBottom: 6 }}>{line}</p>;
    return <p key={i} style={{ color: 'var(--text2)', fontSize: 11 }}>{line}</p>;
  };

  return (
    <div style={{ height: 200, display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--border)' }}>
      <div style={{ padding: '7px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 600 }}>AI BRIEFING</span>
        <span style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--mono)' }}>NEXUS AI</span>
        {loading && <div className="spin" style={{ marginLeft: 'auto' }} />}
      </div>
      <div ref={bodyRef} style={{ flex: 1, padding: 10, overflowY: 'auto', fontSize: 11, lineHeight: 1.7, color: 'var(--text2)' }}>
        {output.split('\n').map((line, i) => formatLine(line, i))}
      </div>
      <div style={{ padding: '7px 8px', background: 'var(--panel2)', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexShrink: 0 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && ask()}
          placeholder="Query any region, conflict or market..."
          disabled={loading}
          style={{ flex: 1, background: 'var(--panel)', border: '1px solid var(--border)', color: 'var(--text)', padding: '5px 9px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font)', outline: 'none' }} />
        <button onClick={ask} disabled={loading}
          style={{ background: 'var(--blue)', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font)', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: loading ? 0.5 : 1 }}>
          Ask
        </button>
      </div>
    </div>
  );
}
