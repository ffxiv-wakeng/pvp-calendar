import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelpTip } from '@/components/HelpTip';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import {
  TARGET_MALMSTONE_LEVEL,
  DAILY_FRONTLINE_BONUS_EXP,
  SERIES_END_DATE,
  getRemainingDaysInSeries,
  getExpForNextLevel,
  calculateMalmstoneProgress,
  calculateFrontlineMatches,
  calculateSimpleModeMatches,
} from '@/lib/malmstoneData';
import {
  Plus,
  Minus,
  Shield,
  Gem,
  CalendarCheck,
  Feather,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MalmstoneCalculatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MalmstoneCalculator({
  open,
  onOpenChange,
}: MalmstoneCalculatorProps) {
  const { t, language } = useSettingsContext();

  // 当前等级（默认 1）与当前等级经验（默认 0）
  const [level, setLevel] = useState<number>(1);
  const [exp, setExp] = useState<number>(0);

  // 切换等级时同步修正当前等级经验上限
  const updateLevel = (newLevel: number) => {
    const clamped = Math.min(
      TARGET_MALMSTONE_LEVEL,
      Math.max(1, Math.floor(newLevel || 1))
    );
    setLevel(clamped);
    if (clamped >= TARGET_MALMSTONE_LEVEL) {
      setExp(0);
    } else {
      const maxExp = getExpForNextLevel(clamped);
      setExp((prev) => Math.min(maxExp - 1, Math.max(0, prev)));
    }
  };

  // 计算星里路标总体进度与差额经验
  const progress = useMemo(
    () => calculateMalmstoneProgress(level, exp),
    [level, exp]
  );

  // 分段进度：每一级一段，段宽按该级所需经验占比，便于直观看出各等级段的跨度
  const levelSegments = useMemo(() => {
    const segments: { lvl: number; weight: number; fill: number }[] = [];
    for (let lvl = 1; lvl < TARGET_MALMSTONE_LEVEL; lvl++) {
      const weight = getExpForNextLevel(lvl);
      let fill = 0;
      if (lvl < progress.clampedLevel) fill = 1;
      else if (lvl === progress.clampedLevel) fill = progress.clampedExp / weight;
      segments.push({ lvl, weight, fill });
    }
    return segments;
  }, [progress.clampedLevel, progress.clampedExp]);

  // 计算距离当前赛季结束的剩余天数与日期格式化
  const remainingDays = useMemo(() => getRemainingDaysInSeries(), []);
  const formattedEndDate = useMemo(() => {
    const [year, month, day] = SERIES_END_DATE.split('-');
    if (language === 'en') {
      return `${year}-${month}-${day}`;
    }
    return `${year}年${month}月${day}日`;
  }, [language]);

  // 赛季结束提醒文本拆分（高亮加粗天数）
  const seriesNoticeParts = useMemo(() => {
    const withDate = t.seriesDaysRemaining.replace('{date}', formattedEndDate);
    return withDate.split('{days}');
  }, [t.seriesDaysRemaining, formattedEndDate]);

  // 计算各玩法所需场次
  const modeResults = useMemo(() => {
    const { remainingExp } = progress;
    const dailyFl = calculateFrontlineMatches(
      remainingExp,
      DAILY_FRONTLINE_BONUS_EXP
    );
    const fl = calculateFrontlineMatches(remainingExp, 0);
    const cc = calculateSimpleModeMatches(remainingExp, 700, 900);
    const rw = calculateSimpleModeMatches(remainingExp, 750, 1250);

    return [
      {
        id: 'daily-frontline',
        name: t.dailyFrontline,
        desc: t.dailyFrontlineDesc,
        expectedDesc: t.dailyExpectedDesc,
        icon: CalendarCheck,
        minMatches: dailyFl.minMatches,
        maxMatches: dailyFl.maxMatches,
        expectedMatches: dailyFl.expectedMatches,
      },
      {
        id: 'frontline',
        name: t.frontline,
        desc: t.frontlineModeDesc,
        expectedDesc: t.flExpectedDesc,
        icon: Shield,
        minMatches: fl.minMatches,
        maxMatches: fl.maxMatches,
        expectedMatches: fl.expectedMatches,
      },
      {
        id: 'cc',
        name: t.crystallineConflict,
        desc: t.ccModeDesc,
        icon: Gem,
        minMatches: cc.minMatches,
        maxMatches: cc.maxMatches,
      },
      {
        id: 'rival-wings',
        name: t.rivalWings,
        desc: t.rivalWingsDesc,
        icon: Feather,
        minMatches: rw.minMatches,
        maxMatches: rw.maxMatches,
      },
    ];
  }, [progress, t]);

  // 使用全角～连接且不加空格
  const formatRange = (min: number, max: number) => {
    if (min === max) return `${min}`;
    return `${min}～${max}`;
  };

  // 根据剩余天数决定提醒颜色：<=14 错误色，<=40 警告色，其余主色
  const isErrorDays = remainingDays <= 14;
  const isWarningDays = !isErrorDays && remainingDays <= 40;

  // 统一的卡片外观：一层发丝边框 + 卡片底色，整个弹窗只用这一种卡片
  const cardClass = 'rounded-lg border border-foreground/10 bg-card';
  // 步进按钮：悬停变色、按下轻微回弹
  const stepButtonClass =
    'h-full w-10 rounded-none text-muted-foreground hover:bg-muted hover:text-foreground active:scale-90 transition-[transform,color,background-color] duration-150 shrink-0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96%] sm:max-w-[680px] md:max-w-[840px] max-h-[90vh] flex flex-col p-0 gap-0 rounded-xl overflow-hidden">
        {/* 标题 + 赛季倒计时（以状态圆点 + 一行说明呈现，不再单独占一个色块） */}
        <DialogHeader className="px-5 sm:px-6 pt-5 pb-3 space-y-1.5 text-left">
          <DialogTitle className="text-base sm:text-lg font-semibold tracking-tight">
            {t.malmstoneTitle}
          </DialogTitle>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span className="relative flex h-2 w-2 shrink-0">
              {isErrorDays && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-60 animate-ping motion-reduce:hidden" />
              )}
              <span
                className={cn(
                  'relative inline-flex h-2 w-2 rounded-full',
                  isErrorDays
                    ? 'bg-rose-500'
                    : isWarningDays
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                )}
              />
            </span>
            <span>
              {seriesNoticeParts[0]}
              <strong
                className={cn(
                  'font-semibold mx-0.5 tabular-nums',
                  isErrorDays
                    ? 'text-rose-600 dark:text-rose-400'
                    : isWarningDays
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-foreground'
                )}
              >
                {remainingDays}
              </strong>
              {seriesNoticeParts[1]}
            </span>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-5 sm:px-6 pt-2 pb-5 sm:pb-6 space-y-5">
          {/* 进度卡片：左侧输入（等级、经验），右侧结果（剩余经验 + 分段进度），中间一条细分隔线 */}
          <div className={cn(cardClass, 'grid grid-cols-1 md:grid-cols-[248px_1fr]')}>
            {/* 左侧：当前等级 & 当前等级经验 */}
            <div className="flex flex-col gap-3.5 p-4 border-b md:border-b-0 md:border-r border-foreground/10">
              {/* 1. 当前等级 */}
              <div className="space-y-1.5">
                <Label htmlFor="malmstone-level" className="text-[13px] font-medium text-muted-foreground">
                  {t.currentSeriesLevel}
                </Label>
                <div className="flex items-center h-10 rounded-md border border-input bg-background overflow-hidden transition-shadow focus-within:ring-2 focus-within:ring-ring/40">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="-1"
                    className={cn(stepButtonClass, 'border-r border-input')}
                    onClick={() => updateLevel(level - 1)}
                    disabled={level <= 1}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <Input
                    id="malmstone-level"
                    type="number"
                    min={1}
                    max={TARGET_MALMSTONE_LEVEL}
                    value={level}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isNaN(val)) return;
                      updateLevel(val);
                    }}
                    className="h-full border-0 text-center font-semibold text-base tabular-nums shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="+1"
                    className={cn(stepButtonClass, 'border-l border-input')}
                    onClick={() => updateLevel(level + 1)}
                    disabled={level >= TARGET_MALMSTONE_LEVEL}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* 2. 当前等级经验 */}
              <div className="space-y-1.5">
                <Label htmlFor="malmstone-exp" className="text-[13px] font-medium text-muted-foreground">
                  {t.currentSeriesExp}
                </Label>
                <div className="relative flex items-center">
                  <Input
                    id="malmstone-exp"
                    type="number"
                    min={0}
                    max={Math.max(0, progress.maxExpInLevel - 1)}
                    step={100}
                    disabled={level >= TARGET_MALMSTONE_LEVEL}
                    value={level >= TARGET_MALMSTONE_LEVEL ? 0 : exp}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isNaN(val)) return;
                      const maxAllowed = Math.max(0, progress.maxExpInLevel - 1);
                      setExp(Math.min(maxAllowed, Math.max(0, Math.floor(val))));
                    }}
                    className="h-10 bg-background pr-20 font-medium tabular-nums focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-0"
                  />
                  {progress.maxExpInLevel > 0 && (
                    <span className="absolute right-3 text-[13px] text-muted-foreground tabular-nums pointer-events-none">
                      / {progress.maxExpInLevel.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：距离 25 级还需经验 */}
            <div className="flex flex-col justify-between gap-4 p-4 sm:p-5">
              <div className="space-y-2">
                <div className="text-[13px] font-medium text-muted-foreground">
                  {t.remainingExpTo25}
                </div>
                <div className="flex items-end justify-between gap-3">
                  <span className="text-4xl sm:text-[44px] font-semibold tracking-tight tabular-nums leading-none text-foreground">
                    {progress.remainingExp.toLocaleString()}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-muted-foreground pb-0.5">
                    {progress.progressPercent.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                {/* 分段进度条：每段代表一级，段宽与该级所需经验成正比 */}
                <div
                  className="flex h-2 gap-[2px]"
                  role="progressbar"
                  aria-label={t.seriesProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(progress.progressPercent)}
                >
                  {levelSegments.map((seg) => (
                    <div
                      key={seg.lvl}
                      className="h-full rounded-[2px] bg-foreground/10 overflow-hidden"
                      style={{ flexGrow: seg.weight, flexBasis: 0 }}
                    >
                      <div
                        className="h-full bg-primary transition-[width] duration-500 ease-out motion-reduce:transition-none"
                        style={{ width: `${seg.fill * 100}%` }}
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between gap-2 text-[13px] text-muted-foreground tabular-nums">
                  {progress.remainingExp === 0 ? (
                    <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="h-3.5 w-3.5 shrink-0" />
                      {t.reachedTargetLevel}
                    </span>
                  ) : (
                    <span>
                      {t.earnedTotalExp}{' '}
                      <span className="text-foreground font-medium">
                        {progress.earnedExp.toLocaleString()}
                      </span>{' '}
                      / {progress.totalExp.toLocaleString()}
                    </span>
                  )}
                  <span className="shrink-0">Lv.{TARGET_MALMSTONE_LEVEL}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 各玩法所需场次：手机两列、桌面一行四列，卡片统一中性配色 */}
          <TooltipProvider delayDuration={0}>
            <div className="space-y-2.5">
              <h3 className="text-[13px] font-medium text-muted-foreground">
                {t.matchesNeeded}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
                {modeResults.map((mode) => {
                  const Icon = mode.icon;
                  const hasExpected = mode.expectedMatches !== undefined;
                  return (
                    <div
                      key={mode.id}
                      className={cn(
                        cardClass,
                        'p-3.5 flex flex-col gap-3 transition-colors duration-200 hover:border-foreground/20'
                      )}
                    >
                      {/* 顶部：图标 + 标题 + 说明提示（紧随标题右侧） */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span
                          className="font-medium text-[13px] truncate"
                          title={mode.name}
                        >
                          {mode.name}
                        </span>
                        <HelpTip content={mode.desc} />
                      </div>

                      {/* 底部：场次区间 + 期望场次（无期望值时占位，保证同一行卡片数字对齐） */}
                      <div className="mt-auto space-y-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-semibold tracking-tight tabular-nums leading-none text-foreground">
                            {formatRange(mode.minMatches, mode.maxMatches)}
                          </span>
                          <span className="text-[13px] text-muted-foreground">
                            {t.matchUnit}
                          </span>
                        </div>
                        <div
                          className={cn(
                            'flex items-center gap-1.5 text-[13px] text-muted-foreground tabular-nums',
                            !hasExpected && 'invisible'
                          )}
                          aria-hidden={!hasExpected}
                        >
                          <span>
                            {t.expectedCase}{' '}
                            <span className="font-medium text-foreground">
                              {mode.expectedMatches ?? 0}
                            </span>{' '}
                            {t.matchUnit}
                          </span>
                          {hasExpected && mode.expectedDesc && (
                            <HelpTip content={mode.expectedDesc} />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TooltipProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
