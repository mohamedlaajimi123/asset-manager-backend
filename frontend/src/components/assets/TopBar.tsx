// src/components/assets/TopBar.tsx
import React from 'react';

interface TopBarProps {
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

export const TopBar: React.FC<TopBarProps> = ({ isDarkMode, setIsDarkMode }) => {
  const isDark = isDarkMode;
  const t = {
    topBarBg: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
    border: isDark ? '#334155' : '#e5e7eb',
    textMain: isDark ? '#f8fafc' : '#111827',
    cardBg: isDark ? '#1e293b' : '#ffffff',
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'; 
  };

  return (
    <header style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: '64px',
      backgroundColor: t.topBarBg, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 clamp(16px, 4vw, 48px)', zIndex: 100, transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ backgroundColor: '#2563eb', padding: '6px', borderRadius: '8px', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
        </div>
        <span style={{ fontSize: '16px', fontWeight: 700, color: t.textMain, letterSpacing: '-0.02em' }}>Console Node</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button 
          type="button" 
          onClick={() => setIsDarkMode(!isDarkMode)}
          style={{
            padding: '8px 14px', borderRadius: '8px', border: `1px solid ${t.border}`,
            backgroundColor: t.cardBg, color: t.textMain, cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease'
          }}
        >
          {isDarkMode ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
          )}
          <span>{isDarkMode ? 'Light' : 'Dark'}</span>
        </button>

        <button 
          type="button" 
          onClick={handleLogoutClick}
          style={{
            padding: '8px 14px', borderRadius: '8px', border: isDarkMode ? '1px solid #5f2727' : '1px solid #fee2e2',
            backgroundColor: t.cardBg, color: '#ef4444', cursor: 'pointer',
            fontWeight: 600, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};