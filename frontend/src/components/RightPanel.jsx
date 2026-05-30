import React from 'react';
import NewsFeed from './NewsFeed';
import AIBriefing from './AIBriefing';

export default function RightPanel() {
  return (
    <div style={{ width: 340, background: 'var(--panel)', borderLeft: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      <NewsFeed />
      <AIBriefing />
    </div>
  );
}
