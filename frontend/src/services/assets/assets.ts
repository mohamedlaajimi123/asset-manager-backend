// src/services/assets/assets.ts
import api from '../api';

// Helper to manually pull the local token and build the auth header structure
const getAuthConfig = (isMultipart = false) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      // Let Axios handle the boundary automatically if multipart, otherwise leave blank
      ...(isMultipart ? {} : { 'Content-Type': 'application/json' })
    }
  };
};

// --- FOLDER OPERATIONS ---

export const createCustomFolder = async (name: string) => {
  const response = await api.post('/assets/folders', { name }, getAuthConfig());
  return response.data;
};

export const listFolders = async () => {
  const response = await api.get('/assets/folders/all', getAuthConfig());
  return response.data;
};


// --- ASSET OPERATIONS ---

export const uploadAsset = async (file: File, onUploadProgress?: (progressEvent: any) => void) => {
  const formData = new FormData();
  formData.append('file', file); // Matches FileInterceptor('file')

  // Pass true so it explicitly attaches the Authorization string alongside the Form stream
  const config: any = getAuthConfig(true) || {};
  // Attach Axios onUploadProgress handler if provided
  if (onUploadProgress) config.onUploadProgress = onUploadProgress;

  const response = await api.post('/assets', formData, config);
  return response.data;
};

export const listAssets = async () => {
  const response = await api.get('/assets', getAuthConfig());
  return response.data;
};

export const getStorageUsage = async () => {
  const response = await api.get('/assets/storage', getAuthConfig());
  return response.data;
};

export const downloadAssetUrl = (id: string) => {
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${baseURL}/assets/${id}`;
};

export const getSasUrl = async (id: string) => {
  const response = await api.post(`/assets/${id}/sas`, {}, getAuthConfig());
  return response.data; 
};

export const deleteAsset = async (id: string) => {
  const response = await api.delete(`/assets/${id}`, getAuthConfig());
  return response.data;
};

// --- ADMINISTRATIVE PRIVILEGED OPERATIONS ---

export const adminForceDeleteAsset = async (id: string) => {
  const response = await api.delete(`/assets/admin/all/${id}`, getAuthConfig());
  return response.data;
};