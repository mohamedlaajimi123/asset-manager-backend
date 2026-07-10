import type { ThemePalette } from './types';

export const getThemePalette = (isDarkMode: boolean): ThemePalette => ({
  background: isDarkMode ? '#0b0f19' : '#f8fafc',
  panelLeft: isDarkMode ? '#111827' : '#ffffff', 
  primaryText: isDarkMode ? '#ffffff' : '#0f172a', // Stark readable text
  mutedText: isDarkMode ? '#9ca3af' : '#475569',   // Clear, accessible secondary text
  card: isDarkMode ? '#111827' : '#ffffff',
  border: isDarkMode ? '#374151' : '#cbd5e1',     // Defined box outlines
  input: isDarkMode ? '#1f2937' : '#ffffff',       // Deep high contrast fields
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  errorBg: isDarkMode ? '#451a1a' : '#fef2f2',
  errorBorder: isDarkMode ? '#991b1b' : '#f87171',
  errorText: isDarkMode ? '#fca5a5' : '#991b1b',
});