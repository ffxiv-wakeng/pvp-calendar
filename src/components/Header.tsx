import { useSettingsContext } from '@/contexts/useSettingsContext';
import { MapCalculator } from '@/components/MapCalculator';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Swords } from 'lucide-react';

export function Header() {
  const { t } = useSettingsContext();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Swords className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <h1 className="text-sm sm:text-base font-bold leading-tight">
                {t.appTitle}
              </h1>
              <span className="text-[10px] text-muted-foreground font-mono opacity-60">
                {t.lastUpdate}: {import.meta.env.VITE_LAST_UPDATE}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <MapCalculator />
          <SettingsPanel />
        </div>
      </div>
    </header>
  );
}
