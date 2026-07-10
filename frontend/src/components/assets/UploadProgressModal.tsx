// src/components/assets/UploadProgressModal.tsx
import React from 'react';

interface UploadProgressModalProps {
  isOpen: boolean;
  filename: string;
  progress: number;
  isDarkMode: boolean;
  theme: any; 
}

export const UploadProgressModal: React.FC<UploadProgressModalProps> = ({ 
  isOpen, 
  filename,
  progress,
  isDarkMode, 
  theme 
}) => {
  if (!isOpen) return null;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: '24px',
    padding: '16px 18px',
    borderRadius: '16px',
    border: `1px solid ${theme.border || (isDarkMode ? '#334155' : '#e2e8f0')}`,
    backgroundColor: theme.cardBg || (isDarkMode ? '#1e293b' : '#ffffff'),
    boxShadow: isDarkMode
      ? '0 10px 25px -12px rgba(0, 0, 0, 0.35)'
      : '0 10px 25px -12px rgba(15, 23, 42, 0.08)',
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    boxSizing: 'border-box',
    animation: 'fadeIn 0.2s ease-out',
  };

  const progressValue = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative', width: '36px', height: '36px', flexShrink: 0 }}>
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: `3px solid ${isDarkMode ? 'rgba(37, 99, 235, 0.12)' : '#eff6ff'}`,
          borderRadius: '50%'
        }} />
        <div style={{
          boxSizing: 'border-box',
          position: 'absolute',
          width: '100%',
          height: '100%',
          border: '3px solid transparent',
          borderTopColor: '#2563eb',
          borderRightColor: '#60a5fa',
          borderRadius: '50%',
          animation: 'spin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite'
        }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginBottom: '6px' }}>
          <span style={{
            margin: 0,
            fontSize: '14px',
            color: theme.textMain || (isDarkMode ? '#f8fafc' : '#0f172a'),
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            Uploading {filename || 'your file'} to Azure cluster...
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', flexShrink: 0 }}>
            {progressValue}%
          </span>
        </div>
        <div style={{ width: '100%', height: '8px', borderRadius: '999px', backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9', overflow: 'hidden' }}>
          <div style={{ width: `${progressValue}%`, height: '100%', borderRadius: '999px', background: 'linear-gradient(90deg, #2563eb, #60a5fa)' }} />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}} />
    </div>
  );
};