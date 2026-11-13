import { useState } from 'react';
import { Settings, Globe, Sun, Moon, Monitor, Clock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { checkForAppUpdates } from '@/lib/pwa';
import {
  DropdownMenu,
  DropdownMenuContent,
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
import { HelpTip } from '@/components/HelpTip';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { TIMEZONE_OPTIONS, ACTIVE_TIME_OPTIONS, Theme } from '@/hooks/useSettings';
import { Language } from '@/lib/i18n';

const languages: { value: Language; label: string }[] = [
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'en', label: 'English' },
];

const themes: { value: Theme; icon: typeof Sun; labelKey: 'light' | 'dark' | 'system' }[] = [
  { value: 'light', icon: Sun, labelKey: 'light' },
  { value: 'dark', icon: Moon, labelKey: 'dark' },
  { value: 'system', icon: Monitor, labelKey: 'system' },
];

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
        toast.error(t.updateCheckFailed);
      }
    } catch {
      toast.error(t.updateCheckFailed);
    } finally {
      setIsCheckingUpdate(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 relative"
          title={t.settings}
        >
          <Settings className="h-5 w-5" />
          <span className="sr-only">{t.settings}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 max-h-[calc(100dvh-5rem)] overflow-y-auto">
        <DropdownMenuLabel>{t.settings}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* 语言设置 */}
        <div className="p-2">
          <span className="text-xs text-muted-foreground mb-1.5 block">
            {t.language}
          </span>
          <div className="flex gap-1" role="group" aria-label={t.language}>
            {languages.map((lang) => (
              <Button
                key={lang.value}
                type="button"
                variant={language === lang.value ? 'default' : 'outline'}
                size="sm"
                className="flex-1"
                aria-pressed={language === lang.value}
                onClick={() => updateSettings({ language: lang.value })}
              >
                {lang.label}
              </Button>
            ))}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 主题设置 */}
        <div className="p-2">
          <span className="text-xs text-muted-foreground mb-1.5 block">
            {t.theme}
          </span>
          <div className="flex gap-1" role="group" aria-label={t.theme}>
            {themes.map((th) => {
              const Icon = th.icon;
              const label = t[th.labelKey];
              return (
                <Button
                  key={th.value}
                  type="button"
                  variant={theme === th.value ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  aria-label={label}
                  aria-pressed={theme === th.value}
                  title={label}
                  onClick={() => updateSettings({ theme: th.value })}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* 时区设置 */}
        <div className="p-2">
          <label
            htmlFor="settings-timezone"
            className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"
          >
            <Globe className="h-3.5 w-3.5" />
            {t.timezone}
          </label>
          <Select
            value={String(timezone)}
            onValueChange={(value) => updateSettings({ timezone: parseFloat(value) })}
          >
            <SelectTrigger id="settings-timezone" className="w-full">
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

        {/* 活跃时间快照设置 */}
        <div className="p-2">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
            <label htmlFor="settings-active-time" className="text-xs text-muted-foreground">
              {t.activeTime}
            </label>
            <HelpTip content={t.activeTimeHelp} />
          </div>
          <Select
            value={activeTime}
            onValueChange={(value) => updateSettings({ activeTime: value })}
          >
            <SelectTrigger id="settings-active-time" className="w-full">
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

        {/* 版本信息与检查更新 */}
        <div className="p-2 space-y-2.5">
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t.appVersion}</span>
              <span className="font-medium tabular-nums text-foreground">
                {import.meta.env.VITE_APP_VERSION}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t.supportGameVer}</span>
              <span className="font-medium tabular-nums text-foreground">
                {import.meta.env.VITE_SUPPORT_GAME_VER}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t.lastUpdate}</span>
              <span className="font-medium tabular-nums text-foreground">
                {import.meta.env.VITE_LAST_UPDATE}
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full h-8 text-xs"
            onClick={handleCheckUpdate}
            disabled={isCheckingUpdate}
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isCheckingUpdate ? 'animate-spin motion-reduce:animate-none' : ''}`} />
            {isCheckingUpdate ? t.checkingUpdate : t.checkUpdate}
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
