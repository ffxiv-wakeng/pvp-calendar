import { useState, useEffect, useCallback } from 'react';
import { Language } from '@/lib/i18n';

export type Theme = 'light' | 'dark' | 'system';
export type TabType = 'frontline' | 'cc';

interface Settings {
  language: Language;
  theme: Theme;
  timezone: number; // UTC offset in hours
  activeTab: TabType;
}

const STORAGE_KEY = 'ffxiv-pvp-settings';

const defaultSettings: Settings = {
  language: 'zh',
  theme: 'light',
  timezone: 8, // Beijing time
  activeTab: 'frontline',
};

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function detectBrowserLanguage(): Language {
  if (typeof navigator === 'undefined') return 'zh';
  const lang = navigator.language.toLowerCase();
  if (lang.startsWith('ja')) return 'ja';
  if (lang.startsWith('en')) return 'en';
  return 'zh';
}

function detectTimezone(): number {
  if (typeof Date === 'undefined') return 8;
  return -new Date().getTimezoneOffset() / 60;
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    if (typeof window === 'undefined') return defaultSettings;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore parse errors
    }
    
    // Auto-detect on first visit
    return {
      ...defaultSettings,
      language: detectBrowserLanguage(),
      timezone: detectTimezone(),
    };
  });

  // Apply theme to document
  useEffect(() => {
    const effectiveTheme = settings.theme === 'system' ? getSystemTheme() : settings.theme;
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(effectiveTheme);
  }, [settings.theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme !== 'system') return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const effectiveTheme = getSystemTheme();
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(effectiveTheme);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [settings.theme]);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // Ignore storage errors
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    ...settings,
    updateSettings,
  };
}

export const TIMEZONE_OPTIONS = [
  { value: -12, label: 'UTC-12:00' },
  { value: -11, label: 'UTC-11:00' },
  { value: -10, label: 'UTC-10:00 (Hawaii)' },
  { value: -9, label: 'UTC-09:00 (Alaska)' },
  { value: -8, label: 'UTC-08:00 (PST)' },
  { value: -7, label: 'UTC-07:00 (MST)' },
  { value: -6, label: 'UTC-06:00 (CST)' },
  { value: -5, label: 'UTC-05:00 (EST)' },
  { value: -4, label: 'UTC-04:00' },
  { value: -3, label: 'UTC-03:00' },
  { value: -2, label: 'UTC-02:00' },
  { value: -1, label: 'UTC-01:00' },
  { value: 0, label: 'UTC+00:00 (GMT)' },
  { value: 1, label: 'UTC+01:00 (CET)' },
  { value: 2, label: 'UTC+02:00' },
  { value: 3, label: 'UTC+03:00 (Moscow)' },
  { value: 4, label: 'UTC+04:00' },
  { value: 5, label: 'UTC+05:00' },
  { value: 5.5, label: 'UTC+05:30 (India)' },
  { value: 6, label: 'UTC+06:00' },
  { value: 7, label: 'UTC+07:00' },
  { value: 8, label: 'UTC+08:00 (Beijing/SGT)' },
  { value: 9, label: 'UTC+09:00 (JST/KST)' },
  { value: 10, label: 'UTC+10:00 (Sydney)' },
  { value: 11, label: 'UTC+11:00' },
  { value: 12, label: 'UTC+12:00 (Auckland)' },
];
