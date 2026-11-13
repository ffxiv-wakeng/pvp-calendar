import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapCard, MapBadge } from '@/components/MapCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getCurrentFrontlineMap, getFrontlineMapForDate, FRONTLINE_MAPS } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { zhCN, ja, enUS } from 'date-fns/locale';
import { format } from 'date-fns';

// 语言与 date-fns 本地化对象映射
const locales = {
  zh: zhCN,
  ja: ja,
  en: enUS,
};

export function FrontlineTab() {
  const { t, timezone, activeTime } = useSettingsContext();
  const [currentData, setCurrentData] = useState(() => getCurrentFrontlineMap());

  const refreshData = useCallback(() => {
    setCurrentData(getCurrentFrontlineMap());
  }, []);

  // 从后台切回页面时主动同步一次当前轮换状态，防止长时间挂起后显示过期地图
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshData]);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[4fr_6fr]">
      {/* 当前地图卡片 */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t.currentMap}</h2>
          <MapCard mapId={currentData.map} size="lg" />
          <div className="flex items-center justify-end gap-3">
            <p className="text-xs text-muted-foreground">{t.nextRotation}</p>
            <CountdownTimer
              targetTime={currentData.nextRotation}
              onExpire={refreshData}
              compact
            />
          </div>

          {/* 轮换顺序 */}
          <div className="pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground mb-3">{t.rotationSchedule}</p>
            <div className="flex flex-wrap items-center gap-y-2">
              {FRONTLINE_MAPS.map((mapId, idx) => {
                const isCurrent = idx === currentData.mapIndex;
                return (
                  <div key={`${mapId}-${idx}`} className="flex items-center">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-md transition-colors',
                        isCurrent
                          ? 'bg-primary/15 text-primary font-semibold ring-1 ring-primary/60'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                      title={t.maps[mapId]}
                      aria-label={t.maps[mapId]}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {t.mapShort[mapId]}
                    </span>
                    {idx < FRONTLINE_MAPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/60 mx-1 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 日历卡片 */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground">{t.calendar}</h2>
          </div>
          <FrontlineCalendar timezone={timezone} activeTime={activeTime} />
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            {t.calendarHint.replace('{time}', activeTime)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FrontlineCalendar({ timezone, activeTime }: { timezone: number; activeTime: string }) {
  const { t, language } = useSettingsContext();
  const isMobile = useIsMobile();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const locale = locales[language as keyof typeof locales];

  // 中文环境从周一开始，其余语言从周日开始
  const weekStartDay = language === 'zh' ? 1 : 0;

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = (firstDay.getDay() - weekStartDay + 7) % 7;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // 生成星期表头（2024-01-07 为周日）
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(2024, 0, 7 + i + weekStartDay);
    return format(d, 'EEE', { locale });
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  const monthHeading =
    language === 'zh' || language === 'ja'
      ? format(currentMonth, 'yyyy年M月', { locale })
      : format(currentMonth, 'MMMM yyyy', { locale });

  // 格式化时段文案（不包含多余时区信息）
  const formatTimeRange = (start: string, end: string) => {
    return `${start}~${end}`;
  };

  // 格式化完整日期标题（抽屉与悬浮卡片共用）
  const formatFullDate = (date: Date) => {
    const weekday = t.weekdays[date.getDay()];
    const monthLabel = t.months[date.getMonth()];
    const day = date.getDate();
    const y = date.getFullYear();

    if (language === 'zh') {
      return `${y}年${monthLabel}${day}日 周${weekday}`;
    }
    if (language === 'ja') {
      return `${y}年${monthLabel}${day}日（${weekday}）`;
    }
    return `${weekday}, ${monthLabel} ${day}, ${y}`;
  };

  const handleDateClick = (date: Date) => {
    if (isMobile) {
      setSelectedDate(date);
      setDrawerOpen(true);
    }
  };

  // 获取指定日期的轮换分界信息
  const getRotationInfo = (date: Date) => {
    const maps = getFrontlineMapForDate(date, timezone, activeTime);
    const splitHour = ((15 + timezone) % 24 + 24) % 24;
    const isSplit = splitHour !== 0 && maps.beforeSplitMap !== maps.afterSplitMap;

    const splitHourStr = splitHour.toString().padStart(2, '0');
    const beforeSplitEndStr = (splitHour - 1).toString().padStart(2, '0');

    return { maps, isSplit, splitHourStr, beforeSplitEndStr };
  };

  return (
    <div className="relative max-w-[600px] mx-auto my-2 sm:my-4">
      {/* 月份导航 */}
      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={prevMonth}
          className="h-9 w-9"
          aria-label={t.previousMonth}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-medium text-sm capitalize tabular-nums">
            {monthHeading}
          </span>
          {!isCurrentMonth && (
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-6 px-2 text-[11px] font-medium"
            >
              {t.today}
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={nextMonth}
          className="h-9 w-9"
          aria-label={t.nextMonth}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* 星期表头 */}
      <div className="my-3 sm:my-4 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, i) => (
          <div key={i} className="text-xs font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* 日历网格 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const maps = getFrontlineMapForDate(date, timezone, activeTime);
          const isToday = date.getTime() === today.getTime();
          const isPast = date.getTime() < today.getTime();
          const dateLabel = `${formatFullDate(date)} - ${t.maps[maps.snapshotMap]}`;

          const dayButton = (
            <button
              type="button"
              onClick={() => handleDateClick(date)}
              aria-label={dateLabel}
              className={cn(
                'w-full aspect-square flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-colors relative',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
                isToday
                  ? 'ring-2 ring-primary bg-primary/10 hover:bg-primary/15'
                  : isPast
                  ? 'opacity-65 hover:opacity-100 hover:bg-muted/40'
                  : 'hover:bg-muted/50'
              )}
            >
              <span className={cn('text-sm sm:text-base font-medium tabular-nums leading-tight', isToday && 'text-primary font-semibold')}>
                {date.getDate()}
              </span>
              <MapBadge mapId={maps.snapshotMap} className="text-[10px] sm:text-xs px-1 sm:px-1.5 py-0 sm:py-0.5 mt-0.5 sm:mt-1 leading-tight" />
            </button>
          );

          if (isMobile) {
            return <div key={date.toISOString()}>{dayButton}</div>;
          }

          return (
            <HoverCard key={date.toISOString()} openDelay={80} closeDelay={60}>
              <HoverCardTrigger asChild>{dayButton}</HoverCardTrigger>
              <HoverCardContent className="w-auto min-w-[180px] p-3">
                <div className="text-xs space-y-2">
                  <div className="font-medium text-foreground pb-1.5 border-b border-border/50">
                    {formatFullDate(date)}
                  </div>
                  {(() => {
                    const { isSplit, splitHourStr, beforeSplitEndStr } = getRotationInfo(date);

                    if (!isSplit) {
                      return (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground tabular-nums">
                            {formatTimeRange('00:00', '23:59')}
                          </span>
                          <MapBadge mapId={maps.snapshotMap} />
                        </div>
                      );
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground tabular-nums">
                            {formatTimeRange('00:00', `${beforeSplitEndStr}:59`)}
                          </span>
                          <MapBadge mapId={maps.beforeSplitMap} />
                        </div>
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground tabular-nums">
                            {formatTimeRange(`${splitHourStr}:00`, '23:59')}
                          </span>
                          <MapBadge mapId={maps.afterSplitMap} />
                        </div>
                      </>
                    );
                  })()}
                </div>
              </HoverCardContent>
            </HoverCard>
          );
        })}
      </div>

      {/* 移动端日期详情抽屉 */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="text-lg">
              {selectedDate && formatFullDate(selectedDate)}
            </DrawerTitle>
          </DrawerHeader>
          <div className="border-t border-border/40 mx-4" />
          <div className="px-4 pb-8 pt-4 overflow-y-auto">
            {selectedDate && (() => {
              const { maps, isSplit, splitHourStr, beforeSplitEndStr } = getRotationInfo(selectedDate);

              return (
                <div className="space-y-4">
                  {!isSplit ? (
                    <div className="space-y-2">
                      <div className="text-xs text-muted-foreground text-center tabular-nums">
                        {formatTimeRange('00:00', '23:59')}
                      </div>
                      <MapCard mapId={maps.snapshotMap} size="lg" showFullName className="w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center tabular-nums">
                          {formatTimeRange('00:00', `${beforeSplitEndStr}:59`)}
                        </div>
                        <MapCard mapId={maps.beforeSplitMap} size="lg" showFullName className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center tabular-nums">
                          {formatTimeRange(`${splitHourStr}:00`, '23:59')}
                        </div>
                        <MapCard mapId={maps.afterSplitMap} size="lg" showFullName className="w-full" />
                      </div>
                    </>
                  )}
                </div>
              );
            })()}
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
