import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapCard, MapBadge } from '@/components/MapCard';
import { CountdownTimer } from '@/components/CountdownTimer';
import { getCurrentCCMap, getCCTimeline, CC_MAPS } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export function CrystallineConflictTab() {
  const { t, timezone } = useSettingsContext();
  const [currentData, setCurrentData] = useState(() => getCurrentCCMap());
  const [timeline, setTimeline] = useState(() => getCCTimeline(30));
  const [, setTick] = useState(0);

  const refreshData = useCallback(() => {
    setCurrentData(getCurrentCCMap());
    setTimeline(getCCTimeline(30));
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(t => t + 1);
      if (Date.now() % 60000 < 1000) {
        setTimeline(getCCTimeline(30));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid gap-4 md:gap-6 lg:grid-cols-[4fr_6fr]">
      {/* Current Map Card */}
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

          {/* Rotation order */}
          <div className="pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground mb-3">{t.rotationSchedule}</p>
            <div className="flex flex-wrap items-center gap-y-1.5">
              {CC_MAPS.map((mapId, idx) => (
                <div key={mapId} className="flex items-center">
                  <span 
                    className={cn(
                      "text-xs px-2 py-1 rounded-md bg-secondary",
                      mapId === currentData.map && "ring-2 ring-primary bg-primary/20"
                    )}
                  >
                    {t.maps[mapId]}
                  </span>
                  {idx < CC_MAPS.length - 1 && (
                    <ArrowRight className="h-3 w-3 text-muted-foreground/50 mx-1" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Card */}
      <Card className="glass-card overflow-hidden">
        <CardContent className="p-4 sm:p-6">
          <h2 className="text-sm font-medium text-muted-foreground mb-4">
            {t.timeline}
          </h2>
          <ScrollArea className="h-[560px] pr-2">
            <div className="space-y-1">
              {timeline.slice(0, 16).map((entry, idx) => {
                const isActive = idx === 0;
                const { time: startTimeLocal, isNextDay: startNextDay } = formatTimeForTimezone(entry.startTime, timezone);
                const { time: endTimeLocal, isNextDay: endNextDay } = formatTimeForTimezone(entry.endTime, timezone);
                
                return (
                  <div 
                    key={entry.startTime.toISOString()}
                    className={cn(
                      "flex items-center gap-3 p-2.5 rounded-lg transition-all",
                      isActive 
                        ? "bg-primary/10 border border-primary/20" 
                        : "hover:bg-muted/30"
                    )}
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className={cn(
                        "w-2.5 h-2.5 rounded-full",
                        isActive ? "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]" : "bg-muted-foreground/20"
                      )} />
                      {idx < timeline.length - 1 && (
                        <div className="w-px h-6 bg-border/50 mt-1" />
                      )}
                    </div>

                    {/* Time range */}
                    <div className="text-xs text-muted-foreground w-28 shrink-0 font-mono">
                      <div>{startNextDay ? t.nextDay : ''}{isActive ? t.current : startTimeLocal}</div>
                      <div className="text-[10px] opacity-60">～ {endNextDay ? t.nextDay : ''}{endTimeLocal}</div>
                    </div>

                    {/* Map info - full name only */}
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className={cn(
                        "text-sm truncate",
                        isActive ? "text-foreground font-medium" : "text-muted-foreground"
                      )}>
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
