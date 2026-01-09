import { Settings, Globe, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { TIMEZONE_OPTIONS, Theme } from '@/hooks/useSettings';
import { Language } from '@/lib/i18n';

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

export function SettingsPanel() {
  const { t, language, theme, timezone, updateSettings } = useSettingsContext();

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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
