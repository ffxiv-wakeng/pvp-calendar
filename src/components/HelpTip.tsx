import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { cn } from '@/lib/utils';

interface HelpTipProps {
  content: string;
  className?: string;
}

/**
 * 统一的说明提示组件：
 * 移动端及触屏设备使用非阻塞 Popover 弹出，桌面鼠标环境使用 Tooltip 悬浮/聚焦展示
 */
export function HelpTip({ content, className }: HelpTipProps) {
  const isMobile = useIsMobile();
  const { t } = useSettingsContext();

  const triggerButtonClass = cn(
    'inline-flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors',
    'hover:bg-muted/60 hover:text-foreground active:text-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
    'cursor-pointer shrink-0',
    className
  );

  if (isMobile) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={triggerButtonClass}
            aria-label={t.helpTipLabel}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent
          side="top"
          align="center"
          collisionPadding={12}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
          className="pointer-events-auto z-[70] w-auto max-w-[260px] p-3 text-xs leading-relaxed shadow-lg"
        >
          {content}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={triggerButtonClass}
          aria-label={t.helpTipLabel}
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        collisionPadding={12}
        className="pointer-events-auto z-[70] max-w-[260px] text-xs leading-relaxed"
      >
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
