import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapCard } from '@/components/MapCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getCurrentCCMap, getCCTimeline, CC_MAPS } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CrystallineConflictTab() {
  const { t, timezone } = useSettingsContext();
  const [currentData, setCurrentData] = useState(() => getCurrentCCMap());
  const [timeline, setTimeline] = useState(() => getCCTimeline(16));

  const refreshData = useCallback(() => {
    setCurrentData(getCurrentCCMap());
    setTimeline(getCCTimeline(16));
  }, []);

  // 从后台切回页面时刷新当前地图与时间轴，避免长时间滞留显示过期数据
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshData]);

  // 隐藏时间轴列表最后一项，避免展示截断的不完整时段
  const visibleTimeline = timeline.length > 1 ? timeline.slice(0, -1) : timeline;

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[4fr_6fr]">
      {/* 当前地图卡片 */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <h2 className="text-sm font-medium text-muted-foreground">{t.currentMap}</h2>

          <MapCard mapId={currentData.map} size="lg" showFullName />

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
              {CC_MAPS.map((mapId, idx) => {
                const isCurrent = mapId === currentData.map;
                return (
                  <div key={mapId} className="flex items-center">
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-md transition-colors',
                        isCurrent
                          ? 'bg-primary/15 text-primary font-semibold ring-1 ring-primary/60'
                          : 'bg-secondary text-secondary-foreground'
                      )}
                      aria-current={isCurrent ? 'step' : undefined}
                    >
                      {t.maps[mapId]}
                    </span>
                    {idx < CC_MAPS.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground/60 mx-1 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 时间轴卡片 */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t.timeline}</h2>
          <ScrollArea className="h-auto sm:h-[560px] pr-2">
            <div className="space-y-1">
              {visibleTimeline.map((entry, idx) => {
                const isActive = idx === 0;
                const { time: startTimeLocal, isNextDay: startNextDay } = formatTimeForTimezone(entry.startTime, timezone);
                const { time: endTimeLocal, isNextDay: endNextDay } = formatTimeForTimezone(entry.endTime, timezone);

                return (
                  <div
                    key={entry.startTime.toISOString()}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/10 border border-primary/25'
                        : 'hover:bg-muted/35'
                    )}
                  >
                    {/* 时间轴节点 */}
                    <div className="flex flex-col items-center shrink-0 self-stretch justify-center">
                      <div
                        className={cn(
                          'w-2.5 h-2.5 rounded-full',
                          isActive
                            ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.45)]'
                            : 'bg-muted-foreground/25'
                        )}
                      />
                      {idx < visibleTimeline.length - 1 && (
                        <div className="w-px h-6 bg-border/60 mt-1" />
                      )}
                    </div>

                    {/* 时间范围 */}
                    <div className="text-xs text-muted-foreground min-w-[7.25rem] shrink-0 font-mono tabular-nums">
                      <div className={cn(isActive && 'text-foreground font-medium')}>
                        {startNextDay ? t.nextDay : ''}
                        {isActive ? t.current : startTimeLocal}
                      </div>
                      <div className="text-[11px] text-muted-foreground/80">
                        ～ {endNextDay ? t.nextDay : ''}
                        {endTimeLocal}
                      </div>
                    </div>

                    {/* 地图全称 */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span
                        className={cn(
                          'text-sm truncate',
                          isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                        )}
                      >
                        {t.maps[entry.map]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

function formatTimeForTimezone(date: Date, timezoneOffset: number): { time: string; isNextDay: boolean } {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000;
  const localTime = new Date(utc + timezoneOffset * 3600000);
  
  // Check if it's the next day compared to reference (or today if no reference)
  let isNextDay = false;
  const referenceDate = new Date();
  const refUtc = referenceDate.getTime() + referenceDate.getTimezoneOffset() * 60000;
  const refLocalTime = new Date(refUtc + timezoneOffset * 3600000);
  isNextDay = localTime.getDate() !== refLocalTime.getDate();
  
  const time = localTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  
  return { time, isNextDay };
}
