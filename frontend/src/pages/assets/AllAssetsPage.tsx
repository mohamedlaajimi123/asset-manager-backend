// src/pages/assets/AllAssetsPage.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { listAssets, downloadAssetUrl, uploadAsset, getSasUrl, deleteAsset, getStorageUsage } from '../../services/assets/assets';
import { getDashboardTheme } from '../../components/assets/theme';
import { TopBar } from '../../components/assets/TopBar';
import { AssetCard } from '../../components/assets/AssetCard';
import { UploadProgressModal } from '../../components/assets/UploadProgressModal'; 

// Inject hardware-accelerated fluid slide-down animation directly into the DOM header
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes toastSlideDown {
      0% {
        transform: translate(-50%, -20px) scale(0.95);
        opacity: 0;
      }
      100% {
        transform: translate(-50%, 0) scale(1);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}

interface Asset { 
  id: string; 
  filename: string; 
  mimeType: string; 
  sizeInBytes: number; 
}

interface StorageUsage {
  storageLimit: number;
  storageUsed: number;
  remaining: number;
  percentUsed: number;
}

export const AllAssetsPage: React.FC = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsage, setStorageUsage] = useState<StorageUsage | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState(''); 
  const [uploadProgress, setUploadProgress] = useState(0);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_preference') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Active toast tracking states
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const t = getDashboardTheme(isDarkMode);

  // Triggers self-destructing premium toast alert
  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000); // Dissolves layout after 4 seconds
  };

  const loadAllData = async () => {
    try {
      const [assetData, usageData] = await Promise.all([listAssets(), getStorageUsage()]);
      setAssets(assetData || []);
      setStorageUsage(usageData || null);
    } catch (err) {
      console.error('Failed to load assets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAllData();
  }, []);

  // Real-time upload progress will be driven directly from Axios' onUploadProgress

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      showToast(`"${file.name}" exceeds the 50MB system capacity limit.`, 'error');
      e.target.value = '';
      return;
    }

    if (storageUsage && file.size > storageUsage.remaining) {
      showToast(`"${file.name}" exceeds your remaining storage capacity.`, 'error');
      e.target.value = '';
      return;
    }

    setUploadingFileName(file.name);
    setUploading(true);
    setUploadProgress(0);

    try {
      await uploadAsset(file, (progressEvent: any) => {
        try {
          const total = (progressEvent && (progressEvent.total ?? progressEvent.totalBytes)) ?? file.size ?? 0;
          const loaded = progressEvent?.loaded ?? 0;
          const percentCompleted = total > 0 ? Math.round((loaded * 100) / total) : 0;
          setUploadProgress(percentCompleted);
        } catch (ex) {
          // swallow any unexpected progress calc errors and keep UI stable
          setUploadProgress(0);
        }
      });

      // ensure UI shows 100% before refreshing list
      setUploadProgress(100);
      await loadAllData();
      showToast('Object payload deployed successfully!', 'success');
      e.target.value = '';
    } catch (err: any) {
      console.error('Upload execution failure:', err);
      if (err?.isAxiosError && err.response?.status === 429) {
        showToast('Too many requests at once. Please wait a moment before trying again.', 'error');
      } else {
        showToast('Upload aborted. Network transmission failure.', 'error');
      }
    } finally {
      setUploading(false);
      setUploadingFileName('');
      // leave the bar at 100% briefly so users can see completion, then reset
      setTimeout(() => setUploadProgress(0), 700);
    }
  };

  const handleViewSas = async (id: string) => {
    try {
      const sasData = await getSasUrl(id);
      if (sasData?.url) {
        window.open(sasData.url, '_blank', 'noreferrer');
      } else {
        showToast('Could not locate secure access resource signatures.', 'error');
      }
    } catch (err) {
      showToast('Unauthorized authentication token sequence.', 'error');
    }
  };

  const handleStreamDownload = async (id: string, filename: string) => {
    setSyncingId(id);
    try {
      const token = localStorage.getItem('token');
      const targetUrl = downloadAssetUrl(id);
      
      const response = await axios.get(targetUrl, {
        responseType: 'blob',
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });
      
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      showToast('Stream compilation broken or access denied.', 'error');
    } finally {
      setSyncingId(null);
    }
  };

  const handleAssetDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this object payload?')) return;
    try {
      await deleteAsset(id);
      setAssets(prev => prev.filter(item => item.id !== id));
      showToast('Asset purged from infrastructure node.', 'success');
    } catch (err) {
      showToast('Unable to complete data element mutation.', 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        padding: '100px 64px', textAlign: 'center', fontFamily: 'sans-serif', backgroundColor: t.background, color: t.textMuted, minHeight: '100vh' 
      }}>
        Loading repository assets...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: t.background,
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: '100px clamp(16px, 4vw, 48px) 40px clamp(16px, 4vw, 48px)',
      boxSizing: 'border-box',
      position: 'absolute',
      top: 0,
      left: 0,
      transition: 'background-color 0.2s ease, color 0.2s ease'
    }}>
      
      {/* PREMIUM SMOOTH-ANIMATED CENTERED TOAST BANNER */}
      {notification && (
        <div 
          onClick={() => setNotification(null)} // ◄— FIXED: Clicking anywhere on the pill dismisses it!
          style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            padding: '12px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: 600,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
            display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.01em',
            cursor: 'pointer', // ◄— FIXED: Visual indicator that it's clickable
            userSelect: 'none',
            animation: 'toastSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            backgroundColor: notification.type === 'error' ? 'rgba(254, 226, 226, 0.96)' : 'rgba(209, 250, 229, 0.96)',
            color: notification.type === 'error' ? '#b91c1c' : '#047857',
            border: notification.type === 'error' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', // ◄— FIXED: Typo resolved from 'justifycenter'
            width: '20px', 
            height: '20px',
            borderRadius: '50%', 
            fontSize: '11px', 
            color: '#ffffff', 
            fontWeight: 800,
            backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
          }}>
            {notification.type === 'error' ? '✕' : '✓'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div style={{ width: '100%', margin: '0 auto' }}>
        <UploadProgressModal 
          isOpen={uploading} 
          filename={uploadingFileName} 
          progress={uploadProgress}
          isDarkMode={isDarkMode} 
          theme={t} 
        />
        <h2 style={{ fontSize: '30px', fontWeight: 800, color: t.textMain, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>Cloud Object Storage</h2>
        <p style={{ color: t.textMuted, fontSize: '14px', margin: '0 0 32px 0' }}>
          Secure administrative access node linking client payloads with Azure pipeline storage.
        </p>

        {/* METRICS ROW */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 24px', flex: '1 1 200px', maxWidth: '300px', transition: 'all 0.2s ease' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: t.textMuted, display: 'block', marginBottom: '4px' }}>Active Assets</span>
            <span style={{ fontSize: '24px', fontWeight: 700, color: t.textMain }}>{assets.length} Files</span>
          </div>
          <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '12px', padding: '16px 24px', flex: '1 1 260px', maxWidth: '360px', transition: 'all 0.2s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: t.textMuted }}>Storage Capacity</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: t.textMain }}>{storageUsage ? `${storageUsage.percentUsed}% used` : '—'}</span>
            </div>
            {storageUsage ? (
              <>
                <div style={{ height: '8px', backgroundColor: isDarkMode ? '#1f2937' : '#e5e7eb', borderRadius: '999px', overflow: 'hidden', marginBottom: '8px' }}>
                  <div style={{ height: '100%', width: `${Math.min(100, storageUsage.percentUsed)}%`, background: 'linear-gradient(90deg, #2563eb, #10b981)', borderRadius: '999px' }} />
                </div>
                <div style={{ fontSize: '13px', color: t.textMuted }}>
                  {Math.round(storageUsage.storageUsed / 1024 / 1024)} MB of {Math.round(storageUsage.storageLimit / 1024 / 1024)} MB used
                </div>
              </>
            ) : (
              <div style={{ fontSize: '13px', color: t.textMuted }}>Loading usage…</div>
            )}
          </div>
        </div>

        {/* RESTORED PREMIUM UPLOAD CONTAINER AREA */}
        <div style={{
          border: `2px dashed ${t.border}`,
          borderRadius: '16px',
          backgroundColor: t.cardBg,
          padding: '32px 24px',
          textAlign: 'center',
          position: 'relative',
          cursor: 'pointer',
          marginBottom: '40px',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'all 0.2s ease'
        }}>
          <input 
            type="file" 
            onChange={handleFileUpload}
            disabled={uploading}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: uploading ? 'not-allowed' : 'pointer' }} 
          />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#2563eb" style={{ width: '40px', height: '40px' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
            </svg>
            <span style={{ fontSize: '15px', fontWeight: 700, color: t.textMain }}>
              {uploading ? 'Processing security cluster streaming...' : 'Push New Object Payload'}
            </span>
            <span style={{ fontSize: '12px', color: t.textMuted }}>Deploy Images, Documents, or Compressed Systems directly (Max 50MB)</span>
          </div>
        </div>

        {/* DATA CONTAINER MAPPED GRID */}
        {assets.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', width: '100%', boxSizing: 'border-box', transition: 'all 0.2s ease' }}>
            <p style={{ color: t.textMuted, margin: 0, fontSize: '15px', fontWeight: 500 }}>No system data structures currently hosted in repository workspace view.</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '24px',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            {assets.map(a => (
              <AssetCard 
                key={a.id}
                asset={a}
                onViewSas={handleViewSas}
                onDelete={handleAssetDelete}
                syncingId={syncingId}
                onDownload={handleStreamDownload}
                isDarkMode={isDarkMode}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default AllAssetsPage;