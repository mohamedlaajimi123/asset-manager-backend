// src/components/assets/theme.ts

export interface Theme {
  background: string;
  cardBg: string;
  textMain: string;
  textMuted: string;
  border: string;
  topBarBg: string;
}

export const getDashboardTheme = (isDark: boolean): Theme => ({
  background: isDark ? '#0f172a' : '#f9fafb',
  cardBg: isDark ? '#1e293b' : '#ffffff',
  textMain: isDark ? '#f8fafc' : '#111827',
  textMuted: isDark ? '#94a3b8' : '#4b5563',
  border: isDark ? '#334155' : '#e5e7eb',
  topBarBg: isDark ? 'rgba(30, 41, 59, 0.8)' : 'rgba(255, 255, 255, 0.8)',
});