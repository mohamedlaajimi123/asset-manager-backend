// src/components/admin/FolderCard.tsx
import React from 'react';
import type { Theme } from '../../components/assets/theme';

interface Folder {
  id: string;
  name: string;
  userId: string;
  user?: {
    email?: string | null;
    storageLimit?: number;
    storageUsed?: number;
  };
}

interface FolderCardProps {
  folder: Folder;
  itemCount: number;
  usagePercent: number;
  isDarkMode: boolean;
  theme: Theme;
  onClick: () => void;
}

export const FolderCard: React.FC<FolderCardProps> = ({ folder, itemCount, usagePercent, isDarkMode, theme, onClick }) => {
  return (
    <div 
      onClick={onClick}
      style={{
        border: `1px solid ${theme.border}`, borderRadius: '16px', padding: '24px',
        backgroundColor: theme.cardBg, cursor: 'pointer', transition: 'all 0.2s ease',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.01)', display: 'flex', alignItems: 'center', gap: '16px'
      }}
    >
      <div style={{ backgroundColor: isDarkMode ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff', padding: '12px', borderRadius: '12px' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <h4
          title={folder.id}
          style={{
            margin: '0 0 6px 0',
            fontSize: '16px',
            fontWeight: 700,
            color: theme.textMain,
            fontFamily: 'monospace',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}
        >
          {folder.id}
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: theme.textMuted,
            fontWeight: 500,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {folder.name}
          </p>
          {folder.user?.email ? (
            <p style={{
              margin: 0,
              fontSize: '12px',
              color: theme.textMuted,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {folder.user.email}
            </p>
          ) : null}
          <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted, fontWeight: 500 }}>{itemCount} items inside</p>
          <div style={{ marginTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: theme.textMuted, fontWeight: 600 }}>Capacity usage</span>
              <span style={{ fontSize: '11px', color: theme.textMain, fontWeight: 700 }}>{Math.round(usagePercent)}%</span>
            </div>
            <div style={{ height: '6px', borderRadius: '999px', backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, usagePercent)}%`, background: 'linear-gradient(90deg, #2563eb, #10b981)', borderRadius: '999px' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};