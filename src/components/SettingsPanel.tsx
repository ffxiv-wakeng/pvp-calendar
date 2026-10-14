import { useState } from 'react';
import { Settings, Globe, Sun, Moon, Monitor, Clock, HelpCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkForAppUpdates } from '@/lib/pwa';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { TIMEZONE_OPTIONS, ACTIVE_TIME_OPTIONS, Theme } from '@/hooks/useSettings';
import { Language } from '@/lib/i18n';
import { useIsMobile } from '@/hooks/use-mobile';

const languages: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

const themes: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

function HelpTip({ content }: { content: string }) {
  const isMobile = useIsMobile();

  const handleMobileClick = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    alert(content);
  };

  if (isMobile) {
    return (
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={handleMobileClick}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground active:text-foreground cursor-pointer focus:outline-none p-0.5 rounded transition-colors"
        aria-label={content}
      >
        <HelpCircle className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const isTouch = window.innerWidth < 768 || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
            if (isTouch) {
              alert(content);
            }
          }}
          className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer focus:outline-none p-0.5 rounded transition-colors"
          aria-label={content}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="z-[60] text-xs max-w-[220px]">
        {content}
      </TooltipContent>
    </Tooltip>
  );
}

export function SettingsPanel() {
  const { t, language, theme, timezone, activeTime, updateSettings } = useSettingsContext();
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  const handleCheckUpdate = async () => {
    if (isCheckingUpdate) return;
    setIsCheckingUpdate(true);
    try {
      const res = await checkForAppUpdates();
      if (res === 'latest') {
        toast.success(t.alreadyLatest);
      } else if (res === 'updated') {
        // 检测到更新，Service Worker 会通过 onNeedReload 自动提示并刷新
      } else if (res === 'unsupported') {
        toast.info(t.alreadyLatest);
      } else {
        toast.error('检查更新失败，请稍后重试');
      }
    } catch {
      toast.error('检查更新失败，请稍后重试');
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  const currentTheme = themes.find(th => th.value === theme);
  const ThemeIcon = currentTheme?.icon || Moon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t.settings}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Language */}
        <div className="p-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            {t.language}
          </label>
          <div className="flex gap-1">
            {languages.map((lang) => (
              <Button
                key={lang.value}
                variant={language === lang.value ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => updateSettings({ language: lang.value })}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Theme */}
        <div className="p-2">
          <label className="text-xs text-muted-foreground mb-1.5 block">
            {t.theme}
          </label>
          <div className="flex gap-1">
            {themes.map((th) => {
              const Icon = th.icon;
              return (
                <Button
                  key={th.value}
                  variant={theme === th.value ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => updateSettings({ theme: th.value })}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Timezone */}
        <div className="p-2">
          <label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
            <Globe className="h-3 w-3" />
            {t.timezone}
          </label>
          <Select
            value={String(timezone)}
            onValueChange={(value) => updateSettings({ timezone: parseFloat(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONE_OPTIONS.map((tz) => (
                <SelectItem key={tz.value} value={String(tz.value)}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />

        {/* Active Time */}
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <label className="text-xs text-muted-foreground">
              {t.activeTime}
            </label>
            <HelpTip content={t.activeTimeHelp} />
          </div>
          <Select
            value={activeTime}
            onValueChange={(value) => updateSettings({ activeTime: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-56">
              {ACTIVE_TIME_OPTIONS.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <DropdownMenuSeparator />

        {/* Update Check */}
        <div className="p-2 flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-mono text-[11px] opacity-75">
            {t.supportGameVer}: {import.meta.env.VITE_LAST_UPDATE}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs hover:bg-accent"
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isCheckingUpdate ? 'animate-spin' : ''}`} />
            {isCheckingUpdate ? t.checkingUpdate : t.checkUpdate}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
