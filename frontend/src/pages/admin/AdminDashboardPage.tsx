// src/pages/admin/AdminDashboardPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { listFolders, listAssets, adminForceDeleteAsset } from '../../services/assets/assets';
import { getDashboardTheme, type Theme } from '../../components/assets/theme';
import { TopBar } from '../../components/assets/TopBar';
import { FolderCard } from '../../components/admin/FolderCard';
import { AdminAssetRow } from '../../components/admin/AdminAssetRow';

interface Folder { id: string; name: string; userId: string; user?: { email?: string | null; storageLimit?: number; storageUsed?: number; }; }
interface Asset { id: string; filename: string; mimeType: string; sizeInBytes: number; folderId?: string; userId: string; }

export const AdminDashboardPage: React.FC = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_preference') === 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (!notification) return;
    const timeoutId = window.setTimeout(() => setNotification(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [notification]);

  const t: Theme = getDashboardTheme(isDarkMode);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setNotification({ message, type });
  };

  const loadAdminData = async () => {
    try {
      setLoading(true);
      const [fetchedFolders, fetchedAssets] = await Promise.all([listFolders(), listAssets()]);
      setFolders(fetchedFolders || []);
      setAllAssets(fetchedAssets || []);
    } catch (err) {
      console.error('Failed to load administrative telemetry data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadAdminData(); }, []);

  const activeFolderAssets = useMemo(() => {
    if (!selectedFolder) return [];
    return allAssets.filter(asset => asset.folderId === selectedFolder.id || asset.userId === selectedFolder.userId);
  }, [allAssets, selectedFolder]);

  const folderItemCounts = useMemo(() => {
    const counts = new Map<string, number>();
    folders.forEach(folder => counts.set(folder.id, 0));

    allAssets.forEach(asset => {
      folders.forEach(folder => {
        if (asset.folderId === folder.id || asset.userId === folder.userId) {
          counts.set(folder.id, (counts.get(folder.id) ?? 0) + 1);
        }
      });
    });

    return counts;
  }, [folders, allAssets]);

  const folderUsagePercentages = useMemo(() => {
    const percentages = new Map<string, number>();
    folders.forEach(folder => {
      const folderSize = allAssets
        .filter(asset => asset.folderId === folder.id || asset.userId === folder.userId)
        .reduce((sum, asset) => sum + asset.sizeInBytes, 0);
      const storageLimit = folder.user?.storageLimit;
      const percent = storageLimit && storageLimit > 0 ? Math.min(100, (folderSize / storageLimit) * 100) : 0;
      percentages.set(folder.id, percent);
    });
    return percentages;
  }, [folders, allAssets]);

  const handleAdminDelete = async (assetId: string, filename: string) => {
    try {
      await adminForceDeleteAsset(assetId);
      setAllAssets(prev => prev.filter(a => a.id !== assetId));
      showToast(`"${filename}" was permanently removed from the system.`, 'success');
    } catch (err: any) {
      console.error('Failed to execute administrative cleanup mutation.', err);
      if (err?.isAxiosError && err.response?.status === 429) {
        showToast('Too many requests at once. Please wait a moment before trying again.', 'error');
      } else {
        showToast('Failed to execute administrative cleanup mutation.', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '100px 64px', textAlign: 'center', backgroundColor: t.background, color: t.textMuted, minHeight: '100vh', fontFamily: 'sans-serif' }}>
        Loading administrative workspace node...
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: t.background, minHeight: '100vh', width: '100%', boxSizing: 'border-box',
      position: 'absolute', top: 0, left: 0, padding: '100px clamp(16px, 4vw, 48px) 40px clamp(16px, 4vw, 48px)',
      transition: 'all 0.2s ease'
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes toastSlideDown {
          0% { transform: translate(-50%, -20px) scale(0.95); opacity: 0; }
          100% { transform: translate(-50%, 0) scale(1); opacity: 1; }
        }
      `}} />
      {notification && (
        <div
          onClick={() => setNotification(null)}
          style={{
            position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999,
            padding: '12px 24px', borderRadius: '50px', fontSize: '14px', fontWeight: 600,
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 10px 10px -5px rgba(0, 0, 0, 0.03)',
            display: 'flex', alignItems: 'center', gap: '12px', letterSpacing: '-0.01em',
            cursor: 'pointer', userSelect: 'none', animation: 'toastSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            backgroundColor: notification.type === 'error' ? 'rgba(254, 226, 226, 0.96)' : 'rgba(209, 250, 229, 0.96)',
            color: notification.type === 'error' ? '#b91c1c' : '#047857',
            border: notification.type === 'error' ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <span style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px',
            borderRadius: '50%', fontSize: '11px', color: '#ffffff', fontWeight: 800,
            backgroundColor: notification.type === 'error' ? '#ef4444' : '#10b981',
          }}>
            {notification.type === 'error' ? '✕' : '✓'}
          </span>
          <span>{notification.message}</span>
        </div>
      )}

      <TopBar isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <div style={{ width: '100%', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: t.textMain, margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>System Root Directory</h2>
          <p style={{ color: t.textMuted, fontSize: '14px', margin: 0 }}>Administrative directory monitoring. View isolated clusters and clean up cloud object payloads.</p>
        </div>

        {selectedFolder && (
          <button 
            type="button" onClick={() => setSelectedFolder(null)}
            style={{
              marginBottom: '24px', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${t.border}`,
              backgroundColor: t.cardBg, color: t.textMain, cursor: 'pointer', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px'
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            Back to Folders
          </button>
        )}

        {!selectedFolder ? (
          folders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 24px', backgroundColor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px' }}>
              <p style={{ color: t.textMuted, margin: 0 }}>No system folders exist on this platform instance.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
              {folders.map(folder => (
                <FolderCard 
                  key={folder.id} folder={folder} isDarkMode={isDarkMode} theme={t}
                  itemCount={folderItemCounts.get(folder.id) ?? 0}
                  usagePercent={folderUsagePercentages.get(folder.id) ?? 0}
                  onClick={() => setSelectedFolder(folder)}
                />
              ))}
            </div>
          )
        ) : (
          <div style={{ backgroundColor: t.cardBg, border: `1px solid ${t.border}`, borderRadius: '16px', padding: '32px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', borderBottom: `1px solid ${t.border}`, paddingBottom: '16px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.5"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: t.textMain }}>
                Directory Content: <span style={{ color: '#2563eb', fontFamily: 'monospace' }}>{selectedFolder.id}</span>
              </h3>
            </div>

            {activeFolderAssets.length === 0 ? (
              <p style={{ color: t.textMuted, margin: '24px 0 0 0', textAlign: 'center', fontSize: '14px' }}>This user directory path is completely empty.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {activeFolderAssets.map(asset => (
                  <AdminAssetRow 
                    key={asset.id} asset={asset} theme={t} isDarkMode={isDarkMode}
                    onDelete={() => handleAdminDelete(asset.id, asset.filename)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;