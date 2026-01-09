import { createContext, useContext } from 'react';
import { Theme, TabType } from '@/hooks/useSettings';
import { Language, getTranslation } from '@/lib/i18n';

interface SettingsContextType {
  language: Language;
  theme: Theme;
  timezone: number;
  activeTab: TabType;
  t: ReturnType<typeof getTranslation>;
  updateSettings: (updates: Partial<{
    language: Language;
    theme: Theme;
    timezone: number;
    activeTab: TabType;
  }>) => void;
}

export const SettingsContext = createContext<SettingsContextType | null>(null);

export function useSettingsContext() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettingsContext must be used within SettingsProvider');
  }
  return context;
}
