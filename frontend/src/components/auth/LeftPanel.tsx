import React from 'react';
import type { ThemePalette } from './types';

interface LeftPanelProps {
  theme: ThemePalette;
}

export default function LeftPanel({ theme }: LeftPanelProps) {
  const leftStyle: React.CSSProperties = {
    flex: '1',
    backgroundColor: theme.panelLeft,
    borderRight: `1px solid ${theme.border}`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '60px',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  };

  return (
    <aside style={leftStyle}>
      <div style={{ maxWidth: '420px', width: '100%' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: theme.accent,
            color: '#ffffff',
            marginBottom: '28px',
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>
        </div>
        <h2
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: theme.primaryText,
            margin: '0 0 16px 0',
            lineHeight: 1.2,
            letterSpacing: '-0.02em'
          }}
        >
          Centralized Asset Ecosystem
        </h2>
        <p style={{ fontSize: '15px', color: theme.mutedText, margin: 0, lineHeight: 1.6 }}>
          Access security-cleared object repositories, view generated analytical metrics, and seamlessly upload structural assets from a unified administrative terminal.
        </p>
        
        <div style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: theme.accent, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: theme.mutedText, fontWeight: 500 }}>
              Fully synchronized cloud storage buckets.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ color: theme.accent, display: 'flex', alignItems: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: theme.mutedText, fontWeight: 500 }}>
              Role-based enterprise permissions handling.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}