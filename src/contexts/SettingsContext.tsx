import React, { ReactNode } from 'react';
import { useSettings } from '@/hooks/useSettings';
import { getTranslation } from '@/lib/i18n';
import { SettingsContext } from './useSettingsContext';

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useSettings();
  const t = getTranslation(settings.language);
  
  return (
    <SettingsContext.Provider value={{ ...settings, t }}>
      {children}
    </SettingsContext.Provider>
  );
}
