import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function MapCalculator() {
  const { t, language } = useSettingsContext();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>('12:00');

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
    setDate(d);
    const h = String(d.getHours()).padStart(2, '0');
    const m = String(d.getMinutes()).padStart(2, '0');
    setTime(`${h}:${m}`);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Calculator className="h-4 w-4" />
          <span className="sr-only">{t.calculator}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[98%] sm:max-w-[425px] md:max-w-[800px] max-h-[90%] overflow-y-auto w-full p-0 gap-0 rounded">
        <DialogHeader>
          <DialogTitle>{t.calculator}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row h-full">
          {/* Mobile Input: Native DateTime Picker */}
          <div className="md:hidden p-6 border-b border-border/40 flex flex-col overflow-hidden">
            <SectionHeader title={`${t.date} & ${t.time}`} />
            <div className="w-full min-w-0">
              <Input
                id="mobile-datetime"
                type="datetime-local"
                value={date ? getDateTimeString(date, time) : ''}
                onChange={(e) => handleDateTimeChange(e.target.value)}
                className="w-full max-w-full min-w-0 bg-background"
                style={{ maxWidth: '100%', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Desktop Input: Calendar & Time */}
          <div className="hidden md:flex flex-col p-6 pt-4 md:pt-6 items-center md:border-r border-border/40 bg-card/50">
            <div className="w-full">
              <SectionHeader title={t.date} />
              <div className="flex flex-col gap-6 items-center mt-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  fixedWeeks
                  locale={locales[language as keyof typeof locales]}
                  className="rounded-md border bg-background shadow-sm"
                />
                <div className="flex items-center gap-4 w-full px-2">
                  <label htmlFor="time" className="text-sm font-medium w-12 text-muted-foreground">
                    {t.time}
                  </label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="flex-1 bg-background flex justify-between"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="flex-1 bg-card/50 p-6 pt-4 md:pt-6 min-w-0">
            <SectionHeader title={t.map} />
            {calculatedMaps ? (
              <div className="flex flex-col gap-4 mt-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.frontline}</span>
                      <MapBadge mapId={calculatedMaps.fl} />
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-sm border border-border/50">
                    <MapCard mapId={calculatedMaps.fl} showFullName className="w-full" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{t.crystallineConflict}</span>
                      <MapBadge mapId={calculatedMaps.cc} />
                    </div>
                  </div>
                  <div className="rounded-xl overflow-hidden shadow-sm border border-border/50">
                    <MapCard mapId={calculatedMaps.cc} showFullName className="w-full" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground p-8 text-center border-2 border-dashed border-border/50 rounded-lg m-4 mt-2">
                <Calculator className="h-8 w-8 opacity-50" />
                <span className="text-sm">Select a date and time to calculate maps</span>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
