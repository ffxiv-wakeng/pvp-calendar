import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapCard, MapBadge } from '@/components/MapCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getCurrentFrontlineMap, getFrontlineMapForDate, FrontlineMap, FRONTLINE_MAPS } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

export function FrontlineTab() {
  const { t, timezone } = useSettingsContext();
  const [currentData, setCurrentData] = useState(() => getCurrentFrontlineMap());
  const [, setTick] = useState(0);

  const refreshData = useCallback(() => {
    setCurrentData(getCurrentFrontlineMap());
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[4fr_6fr]">
      {/* Current Map Card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t.currentMap}</h2>
          <MapCard mapId={currentData.map} size="lg" />
          <div className="flex items-center justify-end mt-4 gap-3">
            <p className="text-xs text-muted-foreground">{t.nextRotation}</p>
            <CountdownTimer 
              targetTime={currentData.nextRotation}
              onExpire={refreshData}
              compact
            />
          </div>

          {/* Rotation order */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-3">{t.rotationSchedule}</p>
            <div className="flex flex-wrap items-center gap-y-1.5">
              {FRONTLINE_MAPS.map((mapId, idx) => (
                <div key={mapId} className="flex items-center">
                  <span 
                    className={cn(
                      "text-xs px-2 py-1 rounded-md bg-secondary",
                      mapId === currentData.map && "ring-2 ring-primary bg-primary/20"
                    )}
                  >
                    {t.mapShort[mapId]}
                  </span>
                  {idx < FRONTLINE_MAPS.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">{t.calendar}</h2>
          <FrontlineCalendar timezone={timezone} />
          <p className="text-xs text-muted-foreground mt-4">{t.calendarHint}</p>
        </CardContent>
      </Card>
    </div>
  );
}

function FrontlineCalendar({ timezone }: { timezone: number }) {
  const { t } = useSettingsContext();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  
  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format time range for tooltip based on timezone
  const formatTimeRange = (start: string, end: string) => {
    const timezoneLabel = timezone >= 0 ? `UTC+${timezone}` : `UTC${timezone}`;
    return `${start}~${end} (${timezoneLabel})`;
  };

  return (
    <div className="relative max-w-[600px] mx-auto my-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm">
          {t.months[month]} {year}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="my-4 grid grid-cols-7 gap-1 text-center">
        {t.weekdays.map((day) => (
          <div key={day} className="text-xs text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, idx) => {
          if (!date) {
            return <div key={`empty-${idx}`} className="aspect-square" />;
          }

          const maps = getFrontlineMapForDate(date, timezone);
          const isToday = date.getTime() === today.getTime();
          const isPast = date.getTime() < today.getTime();

          return (
            <HoverCard key={date.toISOString()} openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <div
                  className={cn(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all relative",
                    isToday && "ring-2 ring-primary bg-primary/10",
                    isPast ? "opacity-40" : "hover:bg-muted/50"
                  )}
                >
                  <span className={cn("font-medium", isToday && "text-primary")}>{date.getDate()}</span>
                  <MapBadge mapId={maps.mainMap} className="text-[8px] px-1 py-0 mt-0.5" />
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-auto min-w-[200px] p-3">
                  <div className="text-xs space-y-2">
                    {(() => {
                      const splitHour = ((15 + timezone) % 24 + 24) % 24;
                      const isSplit = splitHour !== 0 && maps.mainMap !== maps.lateNightMap;
                      
                      if (!isSplit) {
                        return (
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{formatTimeRange('00:00', '23:59')}</span>
                            <MapBadge mapId={maps.mainMap} />
                          </div>
                        );
                      }

                      const splitHourStr = splitHour.toString().padStart(2, '0');
                      const beforeSplitEndStr = (splitHour - 1).toString().padStart(2, '0');

                      return (
                        <>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{formatTimeRange('00:00', `${beforeSplitEndStr}:59`)}</span>
                            <MapBadge mapId={maps.mainMap} />
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-muted-foreground">{formatTimeRange(`${splitHourStr}:00`, '23:59')}</span>
                            <MapBadge mapId={maps.lateNightMap} />
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

      {/* Floating tooltip - positioned outside the grid */}

    </div>
  );
}
