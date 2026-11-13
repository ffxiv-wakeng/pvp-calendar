import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { getCurrentFrontlineMap, getCurrentCCMap } from '@/lib/rotation';
import { MapCard, MapBadge } from '@/components/MapCard';
import { zhCN, ja, enUS } from 'date-fns/locale';

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-medium text-muted-foreground mb-4 pb-1">
      {title}
    </h2>
  );
}

const locales = {
  zh: zhCN,
  ja: ja,
  en: enUS,
};

interface MapCalculatorProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function MapCalculator({ open, onOpenChange, trigger }: MapCalculatorProps = {}) {
  const { t, language } = useSettingsContext();
  const [internalOpen, setInternalOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('12:00');

  const isControlled = open !== undefined;
  const dialogOpen = isControlled ? open : internalOpen;
  const setDialogOpen = isControlled ? onOpenChange : setInternalOpen;

  const calculatedMaps = useMemo(() => {
    if (!date || !time) return null;

    try {
      const [hours, minutes] = time.split(':').map(Number);
      const selectedDate = new Date(date);
      selectedDate.setHours(hours, minutes, 0, 0);

      const flResult = getCurrentFrontlineMap(selectedDate);
      const ccResult = getCurrentCCMap(selectedDate);

      return {
        fl: flResult.map,
        cc: ccResult.map,
      };
    } catch (e) {
      return null;
    }
  }, [date, time]);

  const getDateTimeString = (d: Date, tStr: string) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}T${tStr}`;
  };

  const handleDateTimeChange = (val: string) => {
    if (!val) return;
    const d = new Date(val);
    if (isNaN(d.getTime())) return;
    setDate(d);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
  };

  const resetToNow = () => {
    const now = new Date();
    setDate(now);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger !== undefined ? (
        trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : !isControlled ? (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Calculator className="h-4 w-4" />
            <span className="sr-only">{t.calculator}</span>
          </Button>
        </DialogTrigger>
      ) : null}
      <DialogContent className="max-w-[96%] sm:max-w-[440px] md:max-w-[800px] max-h-[90vh] overflow-y-auto w-full p-0 gap-0 rounded-xl">
        <DialogHeader>
          <DialogTitle>{t.calculator}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full">
          {/* 移动端输入：原生日期时间选择器 */}
          <div className="md:hidden p-5 border-b border-border/40 flex flex-col gap-3 overflow-hidden">
            <div className="flex items-center justify-between gap-2">
              <label htmlFor="mobile-datetime" className="text-sm font-medium text-muted-foreground">
                {t.date} & {t.time}
              </label>
              <Button type="button" variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={resetToNow}>
                {t.now}
              </Button>
            </div>
            <div className="w-full min-w-0">
              <Input
                id="mobile-datetime"
                type="datetime-local"
                value={date ? getDateTimeString(date, time) : ''}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                className="w-full max-w-full min-w-0 bg-background text-base"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* 桌面端输入：日历与时间选择器 */}
          <div className="hidden md:flex flex-col p-6 pt-4 md:pt-5 items-center md:border-r border-border/40 bg-card/50">
            <div className="w-full">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground">{t.date}</h2>
                <Button type="button" variant="outline" size="sm" className="h-7 text-xs px-2.5" onClick={resetToNow}>
                  {t.now}
                </Button>
              </div>
              <div className="flex flex-col gap-5 items-center">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(selected) => selected && setDate(selected)}
                  initialFocus
                  fixedWeeks
                  weekStartsOn={language === 'zh' ? 1 : 0}
                  locale={locales[language as keyof typeof locales]}
                  className="rounded-md border bg-background shadow-sm"
                />
                <div className="flex items-center gap-4 w-full px-1">
                  <Label htmlFor="map-calc-time" className="text-sm font-medium w-12 text-muted-foreground shrink-0">
                    {t.time}
                  </Label>
                  <Input
                    id="map-calc-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1 bg-background flex justify-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右栏：计算结果 */}
          <div className="flex-1 bg-card/50 p-5 sm:p-6 pt-4 md:pt-5 min-w-0">
            <SectionHeader title={t.map} />
            {calculatedMaps ? (
              <div className="flex flex-col gap-5 mt-2">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.frontline}</span>
                      <MapBadge mapId={calculatedMaps.fl} />
                    </div>
                  </div>
                  <MapCard mapId={calculatedMaps.fl} showFullName className="w-full max-w-none" />
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.crystallineConflict}</span>
                      <MapBadge mapId={calculatedMaps.cc} />
                    </div>
                  </div>
                  <MapCard mapId={calculatedMaps.cc} showFullName className="w-full max-w-none" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-muted-foreground p-6 text-center border-2 border-dashed border-border/50 rounded-lg mt-2">
                <Calculator className="h-8 w-8 opacity-50" />
                <span className="text-sm">{t.selectDateTimeHint}</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
