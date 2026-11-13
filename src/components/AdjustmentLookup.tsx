import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import { HelpTip } from '@/components/HelpTip';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import {
  JOB_DATA,
  calculateEffectiveHp,
  calculateComboDamage,
  calculateKillThreshold,
} from '@/lib/jobData';
import {
  Shield,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Flame,
  Plus,
  Minus,
  SlidersHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdjustmentLookupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SortField = 'default' | 'hp' | 'damageDealt' | 'damageTaken' | 'lbGauge' | 'effectiveHp';
type SortOrder = 'asc' | 'desc';

export function AdjustmentLookup({ open, onOpenChange }: AdjustmentLookupProps) {
  const { t, language } = useSettingsContext();
  const [activeTab, setActiveTab] = useState<'overview' | 'calc'>('overview');

  // 总览页面状态：默认按照职业顺序排序
  const [overviewSearch, setOverviewSearch] = useState('');
  const [overviewRoleFilter, setOverviewRoleFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('default');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // 计算器页面状态
  const [attackerJobId, setAttackerJobId] = useState<string>('warrior');
  const [potency, setPotency] = useState<number>(40000);
  const [battleHighLevel, setBattleHighLevel] = useState<number>(0);
  const [isGuarding, setIsGuarding] = useState<boolean>(false);
  const [calcRoleFilter, setCalcRoleFilter] = useState<string>('all');
  const [calcSortOrder, setCalcSortOrder] = useState<SortOrder>('desc');

  // 移动端斩杀线计算器视图状态：'form' 为输入模式，'results' 为查看结果模式
  const [mobileCalcView, setMobileCalcView] = useState<'form' | 'results'>('form');

  // 当弹窗打开时，移动端重置为表单输入模式
  useEffect(() => {
    if (open) {
      setMobileCalcView('form');
    }
  }, [open]);

  // 获取当前攻击者职业对象
  const attackerJob = useMemo(
    () => JOB_DATA.find((j) => j.id === attackerJobId) || JOB_DATA[0],
    [attackerJobId]
  );

  // 排序处理
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder(field === 'default' ? 'asc' : 'desc');
    }
  };

  // 格式化百分比
  const formatPercent = (val: number) => {
    if (val === 0) return t.noAdjustment;
    const sign = val > 0 ? '+' : '';
    return `${sign}${Math.round(val * 100)}%`;
  };

  // 格式化极限槽调整
  const formatLbGauge = (seconds: number) => {
    if (seconds === 0) return t.noAdjustment;
    const sign = seconds > 0 ? '+' : '';
    return `${sign}${seconds}${t.seconds}`;
  };

  // 职能定义与筛选顺序：防护 -> 治疗 -> 近战 -> 远敏 -> 法系
  const roles = useMemo(
    () => [
      { key: 'all', label: t.allRoles },
      { key: 'tank', label: t.roles.tank },
      { key: 'healer', label: t.roles.healer },
      { key: 'melee', label: t.roles.melee },
      { key: 'ranged', label: t.roles.ranged },
      { key: 'caster', label: t.roles.caster },
    ],
    [t]
  );

  // 总览数据过滤与排序
  const filteredOverviewData = useMemo(() => {
    const searchLower = overviewSearch.trim().toLowerCase();

    const list = JOB_DATA.filter((job) => {
      // 职能筛选
      if (overviewRoleFilter !== 'all' && job.role !== overviewRoleFilter) {
        return false;
      }
      // 搜索筛选
      if (searchLower) {
        const nameZh = job.name.zh.toLowerCase();
        const nameJa = job.name.ja.toLowerCase();
        const nameEn = job.name.en.toLowerCase();
        return (
          nameZh.includes(searchLower) ||
          nameJa.includes(searchLower) ||
          nameEn.includes(searchLower)
        );
      }
      return true;
    });

    if (sortField === 'default') {
      return sortOrder === 'asc' ? list : [...list].reverse();
    }

    return [...list].sort((a, b) => {
      let aVal = 0;
      let bVal = 0;

      switch (sortField) {
        case 'hp':
          aVal = a.hp;
          bVal = b.hp;
          break;
        case 'damageDealt':
          aVal = a.damageDealt;
          bVal = b.damageDealt;
          break;
        case 'damageTaken':
          aVal = a.damageTaken;
          bVal = b.damageTaken;
          break;
        case 'lbGauge':
          aVal = a.lbGauge;
          bVal = b.lbGauge;
          break;
        case 'effectiveHp':
          aVal = calculateEffectiveHp(a.hp, a.damageTaken);
          bVal = calculateEffectiveHp(b.hp, b.damageTaken);
          break;
        default:
          return 0;
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [overviewSearch, overviewRoleFilter, sortField, sortOrder]);

  // 计算目标受击结果
  const calcResults = useMemo(() => {
    const validPotency = Math.min(999999, Math.max(0, potency || 0));

    const list = JOB_DATA.map((target) => {
      const finalDamage = calculateComboDamage(
        validPotency,
        attackerJob.damageDealt,
        battleHighLevel,
        isGuarding,
        target.damageTaken
      );
      const killRate = calculateKillThreshold(finalDamage, target.hp);

      return {
        target,
        finalDamage: Math.round(finalDamage),
        killRate,
      };
    });

    // 过滤
    const filtered =
      calcRoleFilter === 'all'
        ? list
        : list.filter((item) => item.target.role === calcRoleFilter);

    // 排序
    return filtered.sort((a, b) => {
      return calcSortOrder === 'desc'
        ? b.killRate - a.killRate
        : a.killRate - b.killRate;
    });
  }, [potency, attackerJob, battleHighLevel, isGuarding, calcRoleFilter, calcSortOrder]);

  // 获取指定列当前的排序图标，明确反映排序状态
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50 shrink-0" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="h-3 w-3 text-primary shrink-0" />
    ) : (
      <ArrowDown className="h-3 w-3 text-primary shrink-0" />
    );
  };

  const getAriaSort = (field: SortField): 'ascending' | 'descending' | 'none' => {
    if (sortField !== field) return 'none';
    return sortOrder === 'asc' ? 'ascending' : 'descending';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[96%] sm:max-w-[700px] md:max-w-[850px] lg:max-w-[960px] h-[640px] max-h-[90vh] flex flex-col p-0 gap-0 rounded-xl overflow-hidden">
        {/* 弹窗标题栏：无底部分割线，由下方 Tabs 栏统一承接边界 */}
        <DialogHeader className="px-5 sm:px-6 pt-5 pb-2 border-b-0">
          <DialogTitle>{t.adjustmentLookup}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'overview' | 'calc')}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Tab 导航 */}
          <div className="px-5 sm:px-6 pt-1 pb-2.5 border-b border-border/50 bg-muted/20">
            <TabsList className="grid w-full lg:max-w-[320px] grid-cols-2">
              <TabsTrigger value="overview" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Shield className="h-4 w-4" />
                {t.adjustmentOverview}
              </TabsTrigger>
              <TabsTrigger value="calc" className="flex items-center gap-1.5 text-xs sm:text-sm">
                <Flame className="h-4 w-4" />
                {t.killThresholdCalc}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: 补正总览 */}
          <TabsContent
            value="overview"
            className={cn(
              "flex-1 min-h-0 p-4 sm:p-6 pt-3 gap-3 m-0 mt-0 overflow-hidden outline-none",
              activeTab === 'overview' ? 'flex flex-col' : '!hidden'
            )}
          >
            {/* 顶部搜索与职能筛选 */}
            {/* 移动端：搜索框与职业类型整合为 Select，输入保持 16px 避免 iOS Safari 自动放大 */}
            <div className="flex sm:hidden items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchJob}
                  aria-label={t.searchJob}
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="pl-8 h-9 text-base bg-background"
                />
              </div>
              <div className="w-[128px] shrink-0">
                <Select value={overviewRoleFilter} onValueChange={setOverviewRoleFilter}>
                  <SelectTrigger className="h-9 text-xs bg-background" aria-label={t.filterRole}>
                    <SelectValue placeholder={t.allRoles} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.key} value={r.key} className="text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 桌面端：左侧搜索框，右侧全部职能按钮组 */}
            <div className="hidden sm:flex flex-row gap-2.5 items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchJob}
                  aria-label={t.searchJob}
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>

              {/* 职能按钮组 */}
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t.filterRole}>
                {roles.map((r) => (
                  <Button
                    key={r.key}
                    type="button"
                    variant={overviewRoleFilter === r.key ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs px-2.5"
                    aria-pressed={overviewRoleFilter === r.key}
                    onClick={() => setOverviewRoleFilter(r.key)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 表格展示 */}
            <div className="flex-1 min-h-0 rounded-lg border border-border/60 overflow-hidden">
              <ScrollArea className="h-full w-full [&>div>div]:!block">
                <table className="w-full caption-bottom text-sm border-collapse min-w-[580px] sm:min-w-0">
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-20 shadow-xs">
                    <TableRow className="border-b bg-background/95 backdrop-blur hover:bg-background/95">
                      <TableHead aria-sort={getAriaSort('default')} className="w-[130px] sm:w-[180px] min-w-[130px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('default')}
                          className="flex h-11 w-full items-center gap-1 px-4 text-left font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.job}
                          {renderSortIcon('default')}
                        </button>
                      </TableHead>
                      <TableHead aria-sort={getAriaSort('hp')} className="min-w-[80px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('hp')}
                          className="flex h-11 w-full items-center gap-1 px-4 text-left font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.baseHp}
                          {renderSortIcon('hp')}
                        </button>
                      </TableHead>
                      <TableHead aria-sort={getAriaSort('damageDealt')} className="min-w-[85px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('damageDealt')}
                          className="flex h-11 w-full items-center gap-1 px-4 text-left font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.damageDealt}
                          {renderSortIcon('damageDealt')}
                        </button>
                      </TableHead>
                      <TableHead aria-sort={getAriaSort('damageTaken')} className="min-w-[85px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('damageTaken')}
                          className="flex h-11 w-full items-center gap-1 px-4 text-left font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.damageTaken}
                          {renderSortIcon('damageTaken')}
                        </button>
                      </TableHead>
                      <TableHead aria-sort={getAriaSort('lbGauge')} className="min-w-[110px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('lbGauge')}
                          className="flex h-11 w-full items-center gap-1 px-4 text-left font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.lbGauge}
                          {renderSortIcon('lbGauge')}
                        </button>
                      </TableHead>
                      <TableHead aria-sort={getAriaSort('effectiveHp')} className="min-w-[95px] whitespace-nowrap bg-background/95 p-0">
                        <button
                          type="button"
                          onClick={() => toggleSort('effectiveHp')}
                          className="flex h-11 w-full items-center justify-end gap-1 px-4 text-right font-medium hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                        >
                          {t.effectiveHp}
                          {renderSortIcon('effectiveHp')}
                        </button>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOverviewData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-44 text-center">
                          <div className="flex flex-col items-center justify-center gap-2.5 text-muted-foreground">
                            <p className="text-sm">{t.noMatchingJobs}</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setOverviewSearch('');
                                setOverviewRoleFilter('all');
                              }}
                            >
                              {t.clearFilters}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredOverviewData.map((job) => {
                        const effHp = calculateEffectiveHp(job.hp, job.damageTaken);
                        const jobName = job.name[language] || job.name.zh;

                        return (
                          <TableRow key={job.id} className="hover:bg-muted/40">
                            {/* 职业单元格 */}
                            <TableCell className="font-medium py-2 sm:py-2.5 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <img
                                  src={`./jobs/${job.id}.png`}
                                  alt={jobName}
                                  className="w-5 sm:w-6 h-5 sm:h-6 object-contain shrink-0"
                                />
                                <span className="text-xs sm:text-sm font-normal text-foreground">{jobName}</span>
                              </div>
                            </TableCell>

                            {/* 基础HP */}
                            <TableCell className="text-xs sm:text-sm tabular-nums whitespace-nowrap py-2 sm:py-2.5">
                              {job.hp.toLocaleString()}
                            </TableCell>

                            {/* 给予伤害 */}
                            <TableCell className="whitespace-nowrap py-2 sm:py-2.5">
                              <span
                                className={cn(
                                  'text-xs tabular-nums font-medium',
                                  job.damageDealt < 0
                                    ? 'text-rose-600 dark:text-rose-400 font-semibold'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {formatPercent(job.damageDealt)}
                              </span>
                            </TableCell>

                            {/* 受到伤害 */}
                            <TableCell className="whitespace-nowrap py-2 sm:py-2.5">
                              <span
                                className={cn(
                                  'text-xs tabular-nums font-semibold px-1.5 py-0.5 rounded',
                                  job.damageTaken <= -0.5
                                    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-sky-500/12 text-sky-700 dark:text-sky-400'
                                )}
                              >
                                {formatPercent(job.damageTaken)}
                              </span>
                            </TableCell>

                            {/* 极限槽 */}
                            <TableCell className="whitespace-nowrap py-2 sm:py-2.5">
                              <span
                                className={cn(
                                  'text-xs tabular-nums',
                                  job.lbGauge > 0
                                    ? 'text-amber-700 dark:text-amber-400 font-medium'
                                    : job.lbGauge < 0
                                    ? 'text-emerald-700 dark:text-emerald-400 font-medium'
                                    : 'text-muted-foreground'
                                )}
                              >
                                {formatLbGauge(job.lbGauge)}
                              </span>
                            </TableCell>

                            {/* 等效血量 */}
                            <TableCell className="text-right whitespace-nowrap py-2 sm:py-2.5 pr-4">
                              <span className="font-bold text-xs sm:text-sm tabular-nums text-primary">
                                {effHp.toLocaleString()}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </table>
                <ScrollBar orientation="horizontal" className="h-1.5 p-0 border-none" />
                <ScrollBar orientation="vertical" className="w-1.5 p-0 border-none" />
              </ScrollArea>
            </div>
          </TabsContent>

          {/* Tab 2: 斩杀线计算器 */}
          <TabsContent
            value="calc"
            className={cn(
              "flex-1 min-h-0 p-4 sm:p-6 pt-3 gap-3 m-0 mt-0 overflow-hidden outline-none",
              activeTab === 'calc' ? 'flex flex-col' : '!hidden'
            )}
          >
            {/* 顶部配置面板 */}
            <TooltipProvider delayDuration={0}>
              <div
                className={cn(
                  "p-3 rounded-xl border border-border/60 bg-muted/30",
                  mobileCalcView === 'results' ? "hidden sm:grid" : "grid",
                  "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_auto_1fr] gap-x-4 gap-y-2.5"
                )}
              >
                {/* 1. 自身职业选择 */}
                <div className="space-y-1.5">
                  <div className="h-5 flex items-center gap-1">
                    <Label htmlFor="calc-attacker-job" className="text-xs text-muted-foreground font-medium">
                      {t.attackerJob}
                    </Label>
                    <HelpTip content={t.attackerJobTip} />
                  </div>
                  <Select value={attackerJobId} onValueChange={setAttackerJobId}>
                    <SelectTrigger id="calc-attacker-job" className="h-9 bg-background">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`./jobs/${attackerJob.id}.png`}
                            alt={attackerJob.name[language] || attackerJob.name.zh}
                            className="w-4 h-4 object-contain"
                          />
                          <span>{attackerJob.name[language] || attackerJob.name.zh}</span>
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {JOB_DATA.map((job) => (
                        <SelectItem key={job.id} value={job.id}>
                          <div className="flex items-center gap-2">
                            <img
                              src={`./jobs/${job.id}.png`}
                              alt={job.name[language] || job.name.zh}
                              className="w-4 h-4 object-contain"
                            />
                            <span>{job.name[language] || job.name.zh}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. 连招威力 */}
                <div className="space-y-1.5">
                  <div className="h-5 flex items-center gap-1">
                    <Label htmlFor="calc-potency" className="text-xs text-muted-foreground font-medium">
                      {t.comboPotency}
                    </Label>
                    <HelpTip content={t.comboPotencyTip} />
                  </div>
                  <Input
                    id="calc-potency"
                    type="number"
                    min={0}
                    max={999999}
                    step={1000}
                    value={potency}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      if (isNaN(val)) return;
                      setPotency(Math.min(999999, Math.max(0, Math.floor(val))));
                    }}
                    className="h-9 bg-background tabular-nums text-base sm:text-sm"
                    placeholder="40000"
                  />
                </div>

                {/* 3. 斗志昂扬 */}
                <div className="space-y-1.5 w-full sm:w-28 shrink-0">
                  <div className="h-5 flex items-center">
                    <Label htmlFor="calc-battle-high" className="text-xs text-muted-foreground font-medium">
                      {t.battleHigh}
                    </Label>
                  </div>
                  <div className="flex items-center h-9 border border-input rounded-md bg-background overflow-hidden w-full focus-within:ring-2 focus-within:ring-ring/40">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="-1"
                      className="h-full w-8 rounded-none border-r border-input hover:bg-muted text-muted-foreground shrink-0"
                      onClick={() => setBattleHighLevel((prev) => Math.max(0, prev - 1))}
                      disabled={battleHighLevel <= 0}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      id="calc-battle-high"
                      type="number"
                      min={0}
                      max={5}
                      value={battleHighLevel}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isNaN(val)) return;
                        setBattleHighLevel(Math.min(5, Math.max(0, Math.floor(val))));
                      }}
                      className="h-full border-0 text-center font-bold text-base sm:text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="+1"
                      className="h-full w-8 rounded-none border-l border-input hover:bg-muted text-muted-foreground shrink-0"
                      onClick={() => setBattleHighLevel((prev) => Math.min(5, prev + 1))}
                      disabled={battleHighLevel >= 5}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* 4. 坚守阵地 */}
                <div className="space-y-1.5 shrink-0">
                  <div className="h-5 flex items-center gap-1">
                    <Label htmlFor="calc-guard" className="text-xs text-muted-foreground font-medium">
                      {t.guard}
                    </Label>
                    <HelpTip content={t.guardTip} />
                  </div>
                  <div className="h-9 flex items-center">
                    <Switch
                      id="calc-guard"
                      checked={isGuarding}
                      onCheckedChange={setIsGuarding}
                    />
                  </div>
                </div>
              </div>
            </TooltipProvider>

            {/* 移动端专属确认按钮 */}
            <div
              className={cn(
                "sm:hidden flex flex-col gap-2 pt-1",
                mobileCalcView === 'results' && "hidden"
              )}
            >
              <Button
                type="button"
                className="w-full h-10 text-sm font-semibold flex items-center justify-center gap-2 shadow-sm"
                onClick={() => setMobileCalcView('results')}
              >
                <Flame className="h-4 w-4" />
                <span>{t.confirmCalc}</span>
              </Button>
            </div>

            {/* 移动端专属参数概览条 */}
            <div
              className={cn(
                "sm:hidden items-center justify-between p-2.5 rounded-lg border border-border/60 bg-muted/30 text-xs shrink-0",
                mobileCalcView === 'results' ? "flex" : "hidden"
              )}
            >
              <div className="flex items-center gap-2 min-w-0">
                <img
                  src={`./jobs/${attackerJob.id}.png`}
                  alt={attackerJob.name[language] || attackerJob.name.zh}
                  className="w-5 h-5 object-contain shrink-0"
                />
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-medium text-foreground">
                    {attackerJob.name[language] || attackerJob.name.zh}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="tabular-nums font-semibold text-primary">
                    {potency.toLocaleString()}
                  </span>
                  {battleHighLevel > 0 && (
                    <Badge
                      variant="outline"
                      className="px-1 py-0 h-4 text-[10px] border-amber-500/40 text-amber-700 dark:text-amber-400"
                    >
                      BH{battleHighLevel}
                    </Badge>
                  )}
                  {isGuarding && (
                    <Badge
                      variant="outline"
                      className="px-1 py-0 h-4 text-[10px] border-blue-500/40 text-blue-700 dark:text-blue-400"
                    >
                      {t.guard}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5 shrink-0 ml-2"
                onClick={() => setMobileCalcView('form')}
              >
                <SlidersHorizontal className="h-3 w-3 mr-1" />
                {t.editParams}
              </Button>
            </div>

            {/* 移动端操作栏 */}
            <div
              className={cn(
                "sm:hidden items-center justify-between gap-2 text-xs pt-1 shrink-0",
                mobileCalcView === 'results' ? "flex" : "hidden"
              )}
            >
              <div className="flex-1 max-w-[150px]">
                <Select value={calcRoleFilter} onValueChange={setCalcRoleFilter}>
                  <SelectTrigger className="h-8 text-xs bg-background" aria-label={t.filterRole}>
                    <SelectValue placeholder={t.allRoles} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((r) => (
                      <SelectItem key={r.key} value={r.key} className="text-xs">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs px-2.5 shrink-0"
                onClick={() =>
                  setCalcSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                }
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {calcSortOrder === 'desc' ? t.sortHighToLow : t.sortLowToHigh}
              </Button>
            </div>

            {/* 桌面端操作栏 */}
            <div className="hidden sm:flex items-center justify-between text-xs pt-1">
              <div className="flex flex-wrap items-center gap-1" role="group" aria-label={t.filterRole}>
                {roles.map((r) => (
                  <Button
                    key={r.key}
                    type="button"
                    variant={calcRoleFilter === r.key ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    aria-pressed={calcRoleFilter === r.key}
                    onClick={() => setCalcRoleFilter(r.key)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 shrink-0"
                onClick={() =>
                  setCalcSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                }
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {calcSortOrder === 'desc' ? t.sortHighToLow : t.sortLowToHigh}
              </Button>
            </div>

            {/* 斩杀线结果网格 */}
            <div
              className={cn(
                "rounded-lg border border-border/60 overflow-hidden",
                mobileCalcView === 'results' ? "flex-1 min-h-0 block" : "hidden sm:flex-1 sm:min-h-0 sm:block"
              )}
            >
              <ScrollArea className="h-full w-full">
                <div className="p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {calcResults.map(({ target, finalDamage, killRate }) => {
                      const targetName = target.name[language] || target.name.zh;
                      const isKill = killRate >= 100;
                      const isDangerous = killRate >= 70;

                      return (
                        <div
                          key={target.id}
                          className={cn(
                            'p-3 rounded-lg border transition-colors flex flex-col justify-between gap-2.5',
                            isKill
                              ? 'bg-rose-500/10 border-rose-500/50 shadow-xs'
                              : isDangerous
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'bg-card border-border/50 hover:border-border'
                          )}
                        >
                          {/* 目标职业信息 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img
                                src={`./jobs/${target.id}.png`}
                                alt={targetName}
                                className="w-4 h-4 object-contain shrink-0"
                              />
                              <span className="text-sm font-normal leading-none text-foreground truncate">
                                {targetName}
                              </span>
                            </div>

                            <div
                              className={cn(
                                'font-bold text-base leading-none tabular-nums shrink-0 ml-2',
                                isKill
                                  ? 'text-rose-600 dark:text-rose-400'
                                  : isDangerous
                                  ? 'text-amber-600 dark:text-amber-400'
                                  : 'text-foreground'
                              )}
                            >
                              {killRate.toFixed(1)}%
                            </div>
                          </div>

                          {/* 进度条 */}
                          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                            <div
                              className={cn(
                                'h-full transition-all rounded-full',
                                isKill
                                  ? 'bg-rose-500'
                                  : isDangerous
                                  ? 'bg-amber-500'
                                  : 'bg-primary'
                              )}
                              style={{ width: `${Math.min(100, killRate)}%` }}
                            />
                          </div>

                          {/* 底部详情 */}
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/30">
                            <span className="tabular-nums">
                              HP: {target.hp.toLocaleString()}
                            </span>
                            <div>
                              <span>{t.finalDamage}: </span>
                              <span className="font-semibold text-foreground tabular-nums">
                                {finalDamage.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <ScrollBar className="w-1.5 p-0 border-none" />
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
