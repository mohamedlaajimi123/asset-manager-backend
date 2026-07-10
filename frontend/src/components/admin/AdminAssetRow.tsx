// src/components/admin/AdminAssetRow.tsx
import React from 'react';
import type { Theme } from '../../components/assets/theme';

interface Asset {
  id: string;
  filename: string;
  mimeType: string;
  sizeInBytes: number;
}

interface AdminAssetRowProps {
  asset: Asset;
  theme: Theme;
  isDarkMode: boolean;
  onDelete: () => void;
}

export const AdminAssetRow: React.FC<AdminAssetRowProps> = ({ asset, theme, isDarkMode, onDelete }) => {
  const readableSize = asset.sizeInBytes > 1048576 
    ? `${(asset.sizeInBytes / 1048576).toFixed(1)} MB` 
    : `${(asset.sizeInBytes / 1024).toFixed(1)} KB`;

  return (
    <div 
      style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        padding: '14px 20px', border: `1px solid ${theme.border}`, borderRadius: '12px', 
        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.01)' : '#f9fafb' 
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '80%' }}>
        <span
          title={asset.filename}
          style={{ fontSize: '15px', fontWeight: 700, color: theme.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {asset.filename}
        </span>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: theme.textMuted }}>
          <span>{readableSize}</span>
          <span>•</span>
          <span style={{ textTransform: 'uppercase', fontWeight: 600, fontSize: '11px' }}>{asset.mimeType.split('/')[1] || 'FILE'}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        style={{
          padding: '10px', borderRadius: '8px', border: 'none',
          backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.12)' : '#fee2e2',
          color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Force Erase Asset"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          <line x1="10" y1="11" x2="10" y2="17"></line>
          <line x1="14" y1="11" x2="14" y2="17"></line>
        </svg>
      </button>
    </div>
  );
};