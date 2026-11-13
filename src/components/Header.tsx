import { useSettingsContext } from '@/contexts/useSettingsContext';
import { Toolbox } from '@/components/Toolbox';
import { SettingsPanel } from '@/components/SettingsPanel';

export function Header() {
  const { t } = useSettingsContext();

  return (
    <header className="sticky top-0 md:static z-50 shrink-0 w-full border-b border-border/50 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="container flex min-h-14 py-1.5 max-w-screen-2xl items-center justify-between gap-3 px-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center justify-center w-8 h-8 overflow-hidden rounded-lg shrink-0">
            <img src="./logo.png" alt={t.appTitle} className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0 flex items-baseline gap-x-2 gap-y-0.5 flex-wrap">
            <h1 className="text-base sm:text-lg font-bold leading-tight tracking-tight shrink-0">
              {t.appTitle}
            </h1>
            <span className="text-[11px] sm:text-xs text-muted-foreground leading-tight tabular-nums whitespace-nowrap">
              {import.meta.env.VITE_APP_VERSION} ({t.gameVersionPrefix}{import.meta.env.VITE_SUPPORT_GAME_VER})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Toolbox />
          <SettingsPanel />
        </div>
      </div>
    </header>
  );
}
