import { useMemo } from 'react';
import { format, startOfWeek, addDays } from 'date-fns';
import { zhCN, ja, enUS } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { getFrontlineMapForDate } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { MapCard } from '@/components/MapCard';
import { cn } from '@/lib/utils';

const locales = {
  zh: zhCN,
  ja: ja,
  en: enUS,
};

interface WeeklyExportProps {
  id?: string;
  className?: string;
}

export function WeeklyExport({ id, className }: WeeklyExportProps) {
  const { language, t, timezone } = useSettingsContext();
  const locale = locales[language as keyof typeof locales];

  const weekData = useMemo(() => {
    const today = new Date();
    const monday = startOfWeek(today, { weekStartsOn: 1 });

    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(monday, i);
      const { mainMap } = getFrontlineMapForDate(date, timezone);

      // Custom format for M月d日 to avoid leading zero
      let dateStr = '';
      if (language === 'zh') {
        dateStr = `${date.getMonth() + 1}月${date.getDate()}日`;
      } else {
        dateStr = format(date, 'MMM d', { locale });
      }

      return {
        date,
        mapId: mainMap,
        dayName: format(date, 'EEE', { locale }), // 周一
        dateStr,
      };
    });
  }, [language, timezone, locale]);

  const weekRange = `${format(weekData[0].date, 'yyyy.MM.dd')} - ${format(weekData[6].date, 'MM.dd')}`;

  return (
    <div
      id={id}
      className={cn(
        "w-[500px] bg-background text-foreground p-6 flex flex-col gap-4 font-sans relative overflow-hidden border border-border shadow-2xl",
        className
      )}
      style={{
        minHeight: '800px',
      }}
    >
      {/* Decorative backgrounds - adjusted for theme visibility */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-[80px] -mr-24 -mt-24" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-[80px] -ml-24 -mb-24" />

      {/* Header */}
      <div className="relative z-10 flex flex-col gap-1 border-b border-border pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-md overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {t.weeklyRotation}
            </h1>
            <p className="text-[10px] text-muted-foreground font-semibold tracking-widest uppercase">
              {weekRange}
            </p>
          </div>
        </div>
      </div>

      {/* Content Grid (Unified Table) */}
      <div className="relative z-10 flex flex-col border border-border bg-card rounded-xl overflow-hidden shadow-sm divide-y divide-border/50">
        {weekData.map((item, idx) => (
          <div
            key={idx}
            className="flex items-stretch gap-3 p-3 transition-colors hover:bg-muted/30"
          >
            {/* Left: Date info */}
            <div className="flex flex-col justify-center min-w-[70px] border-r border-border/50 pr-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {item.dayName}
              </span>
              <span className="text-base font-bold tabular-nums leading-none mt-0.5">
                {item.dateStr}
              </span>
            </div>

            {/* Middle: Map Image */}
            <div className="flex-1 rounded-lg overflow-hidden h-12 shadow-sm relative border border-border/30">
              <MapCard size="sm" mapId={item.mapId} className="w-full h-full sm:h-full object-cover" showName={false} />
              <div className="absolute top-1/2 left-2 text-white font-semibold text-sm drop-shadow-lg line-clamp-2">{t.maps[item.mapId]}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 mt-auto pt-4 border-t border-border flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5 text-foreground">
            <span className="text-base font-bold tracking-tight">{t.appTitle}</span>
          </div>
          <p className="text-[10px] text-muted-foreground max-w-[240px] leading-tight mt-0.5">
            {t.appDescription}
          </p>
          <p className="text-[9px] text-primary font-medium mt-1.5 opacity-80">
            pvpc.nbb.fan
          </p>
        </div>
        <div className="bg-white p-1.5 rounded-lg border border-border shadow-md">
          <QRCodeSVG value="https://pvpc.nbb.fan" size={60} level="H" />
        </div>
      </div>
    </div>
  );
}
