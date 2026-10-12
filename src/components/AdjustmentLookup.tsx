import { useState, useMemo } from 'react';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import {
  JOB_DATA,
  JobRole,
  calculateEffectiveHp,
  calculateComboDamage,
  calculateKillThreshold,
} from '@/lib/jobData';
import {
  Shield,
  Search,
  ArrowUpDown,
  Flame,
  HelpCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdjustmentLookupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// 职能色彩样式
const ROLE_COLORS: Record<JobRole, { bg: string; text: string; border: string }> = {
  tank: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/20',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-500/30',
  },
  healer: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-500/30',
  },
  melee: {
    bg: 'bg-red-500/10 dark:bg-red-500/20',
    text: 'text-red-600 dark:text-red-400',
    border: 'border-red-500/30',
  },
  ranged: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/20',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-500/30',
  },
  caster: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/20',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-500/30',
  },
};

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[98%] sm:max-w-[700px] md:max-w-[850px] lg:max-w-[960px] h-[640px] max-h-[90vh] flex flex-col p-0 gap-0 rounded overflow-hidden">
        {/* 弹窗标题栏：与其他弹窗排布统一，无图标和描述 */}
        <DialogHeader className="p-4 sm:p-6 pb-2">
          <DialogTitle>{t.adjustmentLookup}</DialogTitle>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as 'overview' | 'calc')}
          className="flex-1 flex flex-col min-h-0"
        >
          {/* Tab 导航 */}
          <div className="px-4 sm:px-6 pt-2 pb-2 border-b border-border/40 bg-muted/20">
            <TabsList className="grid w-full max-w-[320px] grid-cols-2">
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
            <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchJob}
                  value={overviewSearch}
                  onChange={(e) => setOverviewSearch(e.target.value)}
                  className="pl-8 h-9 text-xs sm:text-sm"
                />
              </div>

              {/* 职能按钮组 */}
              <div className="flex flex-wrap items-center gap-1">
                {roles.map((r) => (
                  <Button
                    key={r.key}
                    variant={overviewRoleFilter === r.key ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 text-xs px-2.5"
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
                <table className="w-full caption-bottom text-sm border-collapse">
                  <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-20 shadow-xs">
                    <TableRow className="border-b bg-background/95 backdrop-blur hover:bg-background/95">
                      <TableHead
                        className="w-[180px] bg-background/95 cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort('default')}
                      >
                        <div className="flex items-center gap-1">
                          {t.job}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="bg-background/95 cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort('hp')}
                      >
                        <div className="flex items-center gap-1">
                          {t.baseHp}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="bg-background/95 cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort('damageDealt')}
                      >
                        <div className="flex items-center gap-1">
                          {t.damageDealt}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="bg-background/95 cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort('damageTaken')}
                      >
                        <div className="flex items-center gap-1">
                          {t.damageTaken}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="bg-background/95 cursor-pointer select-none hover:text-foreground"
                        onClick={() => toggleSort('lbGauge')}
                      >
                        <div className="flex items-center gap-1">
                          {t.lbGauge}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                      <TableHead
                        className="bg-background/95 cursor-pointer select-none hover:text-foreground text-right"
                        onClick={() => toggleSort('effectiveHp')}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {t.effectiveHp}
                          <ArrowUpDown className="h-3 w-3 opacity-60" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOverviewData.map((job) => {
                      const effHp = calculateEffectiveHp(job.hp, job.damageTaken);
                      const jobName = job.name[language] || job.name.zh;

                      return (
                        <TableRow key={job.id} className="hover:bg-muted/40">
                          {/* 职业单元格：仅展示图标与名称（不加粗） */}
                          <TableCell className="font-medium py-2.5">
                            <div className="flex items-center gap-2">
                              <img
                                src={`/jobs/${job.id}.png`}
                                alt={jobName}
                                className="w-6 h-6 object-contain shrink-0"
                              />
                              <span className="text-sm font-normal text-foreground">{jobName}</span>
                            </div>
                          </TableCell>

                          {/* 基础HP */}
                          <TableCell className="text-sm tabular-nums">
                            {job.hp.toLocaleString()}
                          </TableCell>

                          {/* 给予伤害 */}
                          <TableCell>
                            <span
                              className={cn(
                                'text-xs tabular-nums font-medium',
                                job.damageDealt < 0
                                  ? 'text-rose-500 dark:text-rose-400 font-semibold'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {formatPercent(job.damageDealt)}
                            </span>
                          </TableCell>

                          {/* 受到伤害 */}
                          <TableCell>
                            <span
                              className={cn(
                                'text-xs tabular-nums font-semibold px-1.5 py-0.5 rounded',
                                job.damageTaken <= -0.5
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                              )}
                            >
                              {formatPercent(job.damageTaken)}
                            </span>
                          </TableCell>

                          {/* 极限槽 */}
                          <TableCell>
                            <span
                              className={cn(
                                'text-xs tabular-nums',
                                job.lbGauge > 0
                                  ? 'text-amber-600 dark:text-amber-400 font-medium'
                                  : job.lbGauge < 0
                                  ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {formatLbGauge(job.lbGauge)}
                            </span>
                          </TableCell>

                          {/* 等效血量 */}
                          <TableCell className="text-right">
                            <span className="font-bold text-sm tabular-nums text-primary">
                              {effHp.toLocaleString()}
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </table>
                <ScrollBar className="w-1.5 p-0 border-none" />
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1.5fr_auto_1fr] gap-x-4 gap-y-2 p-3 rounded-xl border border-border/60 bg-muted/30">
                {/* 1. 自身职业选择 */}
                <div className="space-y-1.5">
                  <div className="h-5 flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      {t.attackerJob}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        部分职业具有造成伤害的补正
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Select value={attackerJobId} onValueChange={setAttackerJobId}>
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          <img
                            src={`/jobs/${attackerJob.id}.png`}
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
                              src={`/jobs/${job.id}.png`}
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
                  <div className="h-5 flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      {t.comboPotency}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs">
                        连招威力应当填入计算自身buff/敌方debuff后的等效威力
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Input
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
                    className="h-9 bg-background tabular-nums"
                    placeholder="40000"
                  />
                </div>

                {/* 3. 斗志昂扬 */}
                <div className="space-y-1.5 w-28 shrink-0">
                  <div className="h-5 flex items-center">
                    <Label className="text-xs text-muted-foreground font-medium">
                      {t.battleHigh}
                    </Label>
                  </div>
                  <div className="flex items-center h-9 border border-input rounded-md bg-background overflow-hidden w-full">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-full w-8 rounded-none border-r border-input hover:bg-muted text-muted-foreground shrink-0"
                      onClick={() => setBattleHighLevel((prev) => Math.max(0, prev - 1))}
                      disabled={battleHighLevel <= 0}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </Button>
                    <Input
                      type="number"
                      min={0}
                      max={5}
                      value={battleHighLevel}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (isNaN(val)) return;
                        setBattleHighLevel(Math.min(5, Math.max(0, Math.floor(val))));
                      }}
                      className="h-full border-0 text-center font-bold text-sm shadow-none focus-visible:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
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
                  <div className="h-5 flex items-center gap-1.5">
                    <Label className="text-xs text-muted-foreground font-medium">
                      {t.guard}
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer" />
                      </TooltipTrigger>
                      <TooltipContent className="text-xs max-w-[260px]">
                        「周边遗迹群(阵地战)」模式中，身处据点中心旗帜圈内的玩家会获得这一状态，造成的伤害提高50%
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="h-9 flex items-center">
                    <Switch
                      checked={isGuarding}
                      onCheckedChange={setIsGuarding}
                    />
                  </div>
                </div>
              </div>
            </TooltipProvider>

            {/* 第二栏：移除描述文本与总倍率，只保留操作控件 */}
            <div className="flex items-center justify-between text-xs pt-1">
              {/* 职能筛选 */}
              <div className="flex flex-wrap items-center gap-1">
                {roles.map((r) => (
                  <Button
                    key={r.key}
                    variant={calcRoleFilter === r.key ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2.5"
                    onClick={() => setCalcRoleFilter(r.key)}
                  >
                    {r.label}
                  </Button>
                ))}
              </div>

              {/* 排序切换 */}
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs px-2.5 shrink-0"
                onClick={() =>
                  setCalcSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))
                }
              >
                <ArrowUpDown className="h-3 w-3 mr-1" />
                {calcSortOrder === 'desc' ? '从高到低' : '从低到高'}
              </Button>
            </div>

            {/* 斩杀线结果网格 */}
            <div className="flex-1 min-h-0 rounded-lg border border-border/60 overflow-hidden">
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
                            'p-3 rounded-lg border transition-all flex flex-col justify-between gap-2.5',
                            isKill
                              ? 'bg-rose-500/10 border-rose-500/50 shadow-xs'
                              : isDangerous
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'bg-card border-border/50 hover:border-border'
                          )}
                        >
                          {/* 目标职业信息：左上角图标与名称大小一致不加粗，右上角仅百分比 */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <img
                                src={`/jobs/${target.id}.png`}
                                alt={targetName}
                                className="w-4 h-4 object-contain shrink-0"
                              />
                              <span className="text-sm font-normal leading-none text-foreground truncate">
                                {targetName}
                              </span>
                            </div>

                            {/* 斩杀百分比（无字样） */}
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

                          {/* 底部详情：左下角为 HP，右下角为预计伤害 */}
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
