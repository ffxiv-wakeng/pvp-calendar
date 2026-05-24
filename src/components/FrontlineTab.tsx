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
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { WeeklyExport } from '@/components/WeeklyExport';
import * as htmlToImage from 'html-to-image';
import { Image as ImageIcon, Download, Loader2, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function FrontlineTab() {
  const { t, timezone } = useSettingsContext();
  const [currentData, setCurrentData] = useState(() => getCurrentFrontlineMap());
  const [isExporting, setIsExporting] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const node = document.getElementById('weekly-export-node');
      if (!node) throw new Error('Export node not found');

      // Wait a moment for images/fonts to stabilize if needed
      await new Promise(resolve => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(node, {
        quality: 0.95,
        pixelRatio: 2, // Better resolution
      });

      setExportImageUrl(dataUrl);
      setIsExportDialogOpen(true);
      toast.success(t.exportSuccess);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
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
                  <div key={`${mapId}-${idx}`} className="flex items-center">
                    <span
                      className={cn(
                        "text-xs px-2 py-1 rounded-md bg-secondary",
                        idx === currentData.mapIndex && "ring-2 ring-primary bg-primary/20"
                      )}
                      title={t.maps[mapId]}
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
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-muted-foreground">{t.calendar}</h2>
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                onClick={handleExport}
                disabled={isExporting}
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Share2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                )}
                <span className="text-xs">{t.exportWeekly}</span>
              </Button>
            </div>
            <FrontlineCalendar timezone={timezone} />
            <p className="text-xs text-muted-foreground mt-4">{t.calendarHint}</p>
          </CardContent>
        </Card>
      </div>

      {/* Hidden export node */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
        <WeeklyExport id="weekly-export-node" />
      </div>

      {/* Export Result Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-background border-border">
          <DialogHeader className="p-6 pb-4 border-b border-border bg-muted/30">
            <DialogTitle>{t.exportWeekly}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[3/5] max-h-[70vh] w-full overflow-hidden flex items-center justify-center p-6 bg-muted/10 font-sans">
            {exportImageUrl && (
              <img
                src={exportImageUrl}
                alt="Exported weekly map"
                className="max-w-full max-h-full rounded-lg shadow-xl border border-border"
              />
            )}
          </div>
          <div className="p-4 border-t border-border flex justify-end">
            <Button
              variant="outline"
              onClick={() => setIsExportDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { zhCN, ja, enUS } from 'date-fns/locale';
import { format } from 'date-fns';

// Map language to locales
const locales = {
  zh: zhCN,
  ja: ja,
  en: enUS,
};

function FrontlineCalendar({ timezone }: { timezone: number }) {
  const { t, language } = useSettingsContext();
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const locale = locales[language as keyof typeof locales];

  // Sunday start for map calculation/display logic generally works with Date objects directly, 
  // but for calendar grid we need to adjust padding and headers.
  // zh: Monday (1) start, others: Sunday (0) start
  const weekStartDay = language === 'zh' ? 1 : 0;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  // Calculate padding based on week start day
  const startPadding = (firstDay.getDay() - weekStartDay + 7) % 7;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startPadding; i++) {
    days.push(null);
  }
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  // Generate weekdays based on current locale and start day
  // Jan 7 2024 is Sunday. 
  // If starting on Monday (weekStartDay=1), we start from Jan 8.
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(2024, 0, 7 + i + weekStartDay);
    return format(d, 'EEE', { locale });
  });

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Format time range for tooltip based on timezone
  const formatTimeRange = (start: string, end: string) => {
    const timezoneLabel = timezone >= 0 ? `UTC+${timezone}` : `UTC${timezone}`;
    return `${start}~${end} (${timezoneLabel})`;
  };

  // Handle date click for mobile
  const handleDateClick = (date: Date) => {
    if (isMobile) {
      setSelectedDate(date);
      setDrawerOpen(true);
    }
  };

  // Get rotation info for a date (shared between HoverCard and Drawer)
  const getRotationInfo = (date: Date) => {
    const maps = getFrontlineMapForDate(date, timezone);
    const splitHour = ((15 + timezone) % 24 + 24) % 24;
    const isSplit = splitHour !== 0 && maps.mainMap !== maps.lateNightMap;

    const splitHourStr = splitHour.toString().padStart(2, '0');
    const beforeSplitEndStr = (splitHour - 1).toString().padStart(2, '0');

    return { maps, isSplit, splitHourStr, beforeSplitEndStr };
  };

  return (
    <div className="relative max-w-[600px] mx-auto my-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="font-medium text-sm capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale })}
        </span>
        <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="my-4 grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day, i) => (
          <div key={i} className="text-xs text-muted-foreground py-1">
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

          // Mobile: use click handler
          if (isMobile) {
            return (
              <div
                key={date.toISOString()}
                className={cn(
                  "aspect-square flex flex-col items-center justify-center rounded-lg text-xs cursor-pointer transition-all relative",
                  isToday && "ring-2 ring-primary bg-primary/10",
                  isPast ? "opacity-40" : "hover:bg-muted/50"
                )}
                onClick={() => handleDateClick(date)}
              >
                <span className={cn("font-medium", isToday && "text-primary")}>{date.getDate()}</span>
                <MapBadge mapId={maps.mainMap} className="text-[8px] px-1 py-0 mt-0.5" />
              </div>
            );
          }

          // Desktop: use HoverCard
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
                    const { isSplit, splitHourStr, beforeSplitEndStr } = getRotationInfo(date);

                    if (!isSplit) {
                      return (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">{formatTimeRange('00:00', '23:59')}</span>
                          <MapBadge mapId={maps.mainMap} />
                        </div>
                      );
                    }

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

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[85vh]">
          <DrawerHeader className="text-center pb-2">
            <DrawerTitle className="text-lg">
              {selectedDate && (() => {
                const weekday = t.weekdays[selectedDate.getDay()];
                const month = t.months[selectedDate.getMonth()];
                const day = selectedDate.getDate();
                const year = selectedDate.getFullYear();

                if (language === 'zh') {
                  return `${year}年${month}${day}日 周${weekday}`;
                } else if (language === 'ja') {
                  return `${year}年${month}${day}日（${weekday}）`;
                } else {
                  return `${weekday}, ${month} ${day}, ${year}`;
                }
              })()}
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
                      <div className="text-xs text-muted-foreground text-center">
                        {formatTimeRange('00:00', '23:59')}
                      </div>
                      <MapCard mapId={maps.mainMap} size="lg" showFullName className="w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center">
                          {formatTimeRange('00:00', `${beforeSplitEndStr}:59`)}
                        </div>
                        <MapCard mapId={maps.mainMap} size="lg" showFullName className="w-full" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground text-center">
                          {formatTimeRange(`${splitHourStr}:00`, '23:59')}
                        </div>
                        <MapCard mapId={maps.lateNightMap} size="lg" showFullName className="w-full" />
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
