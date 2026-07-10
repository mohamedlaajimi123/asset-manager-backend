// src/components/assets/AssetCard.tsx
import React from 'react';
import { getDashboardTheme } from './theme';

interface Asset { 
  id: string; 
  filename: string; 
  mimeType: string; 
  sizeInBytes: number; 
}

interface AssetCardProps {
  asset: Asset;
  onViewSas: (id: string) => void;
  onDelete: (id: string) => void;
  syncingId: string | null;
  onDownload: (id: string, filename: string) => void;
  isDarkMode: boolean;
}

const getFileFormatSpecs = (filename: string, mimeType: string, isDark: boolean) => {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext) || mimeType.startsWith('image/')) {
    return {
      bgColor: isDark ? 'rgba(37, 99, 235, 0.15)' : '#eff6ff',
      iconColor: '#3b82f6',
      tagText: 'IMAGE',
      path: 'M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l1.409 1.409M6 10.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM3.75 18h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v10.5a1.5 1.5 0 00-1.5 1.5z'
    };
  }
  if (['pdf', 'doc', 'docx', 'txt', 'md'].includes(ext)) {
    return {
      bgColor: isDark ? 'rgba(220, 38, 38, 0.15)' : '#fef2f2',
      iconColor: '#ef4444',
      tagText: 'DOCUMENT',
      path: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z'
    };
  }
  if (['zip', 'rar', 'tar', 'gz'].includes(ext)) {
    return {
      bgColor: isDark ? 'rgba(202, 138, 4, 0.15)' : '#fef9c3',
      iconColor: '#eab308',
      tagText: 'ARCHIVE',
      path: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z'
    };
  }
  return {
    bgColor: isDark ? 'rgba(100, 116, 139, 0.15)' : '#f3f4f6',
    iconColor: isDark ? '#94a3b8' : '#4b5563',
    tagText: 'DATA FILE',
    path: 'M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M5.625 18.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125z'
  };
};

export const AssetCard: React.FC<AssetCardProps> = ({ asset, onViewSas, onDelete, syncingId, onDownload, isDarkMode }) => {
  const t = getDashboardTheme(isDarkMode);
  const specs = getFileFormatSpecs(asset.filename, asset.mimeType, isDarkMode);
  const isSyncing = syncingId === asset.id;

  const readableSize = asset.sizeInBytes > 1048576 
    ? `${(asset.sizeInBytes / 1048576).toFixed(1)} MB` 
    : `${(asset.sizeInBytes / 1024).toFixed(1)} KB`;

  return (
    <div style={{
      border: `1px solid ${t.border}`, borderRadius: '16px', padding: '24px',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      backgroundColor: t.cardBg, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      boxSizing: 'border-box', minHeight: '230px', transition: 'all 0.2s ease'
    }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '10px', backgroundColor: specs.bgColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke={specs.iconColor} style={{ width: '24px', height: '24px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d={specs.path} />
            </svg>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', color: specs.iconColor, backgroundColor: specs.bgColor, padding: '4px 10px', borderRadius: '6px' }}>
            {specs.tagText}
          </span>
        </div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: t.textMain, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={asset.filename}>
          {asset.filename}
        </h4>
        <p style={{ margin: '0 0 24px 0', fontSize: '13px', color: t.textMuted, fontWeight: 500 }}>{readableSize}</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
        <button type="button" onClick={() => onViewSas(asset.id)} style={{ flex: 1, padding: '10px 12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: t.cardBg, border: `1px solid ${t.border}`, color: t.textMain, borderRadius: '8px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          View
        </button>
        <button type="button" onClick={() => onDownload(asset.id, asset.filename)} disabled={isSyncing} style={{ flex: 1, padding: '10px 12px', fontSize: '13px', fontWeight: 600, cursor: isSyncing ? 'not-allowed' : 'pointer', backgroundColor: isSyncing ? '#9ca3af' : '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px' }}>
          {isSyncing ? 'Syncing...' : 'Stream'}
        </button>
        <button type="button" onClick={() => onDelete(asset.id)} style={{ padding: '10px 12px', cursor: 'pointer', backgroundColor: t.cardBg, border: isDarkMode ? '1px solid #5f2727' : '1px solid #fee2e2', color: '#ef4444', borderRadius: '8px' }}>
          Delete
        </button>
      </div>
    </div>
  );
};