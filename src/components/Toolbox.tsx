import { useState } from 'react';
import { Package, Calculator, Swords, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { MapCalculator } from '@/components/MapCalculator';
import { AdjustmentLookup } from '@/components/AdjustmentLookup';
import { WeeklyExport } from '@/components/WeeklyExport';
import * as htmlToImage from 'html-to-image';
import { toast } from 'sonner';

export function Toolbox() {
  const { t } = useSettingsContext();

  // 弹窗状态
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);

  // 导出相关状态
  const [isExporting, setIsExporting] = useState(false);
  const [exportImageUrl, setExportImageUrl] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // 执行周报导出
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const node = document.getElementById('toolbox-weekly-export-node');
      if (!node) throw new Error('Export node not found');

      // 等待图片和样式渲染稳定
      await new Promise((resolve) => setTimeout(resolve, 500));

      const dataUrl = await htmlToImage.toPng(node, {
        quality: 0.95,
        pixelRatio: 2,
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9 relative">
            <Package className="h-5 w-5" />
            <span className="sr-only">{t.toolbox}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuLabel>{t.toolbox}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* 1. 地图计算器 */}
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2"
            onSelect={() => setCalculatorOpen(true)}
          >
            <Calculator className="h-4 w-4" />
            <span>{t.calculator}</span>
          </DropdownMenuItem>

          {/* 2. 导出本周战场图 */}
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2"
            disabled={isExporting}
            onSelect={(e) => {
              e.preventDefault();
              handleExport();
            }}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            <span>{t.exportWeekly}</span>
          </DropdownMenuItem>

          {/* 3. 补正速查 */}
          <DropdownMenuItem
            className="cursor-pointer gap-2 py-2"
            onSelect={() => setLookupOpen(true)}
          >
            <Swords className="h-4 w-4" />
            <span>{t.adjustmentLookup}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 补正速查弹窗 */}
      <AdjustmentLookup open={lookupOpen} onOpenChange={setLookupOpen} />

      {/* 地图计算器弹窗 */}
      <MapCalculator
        open={calculatorOpen}
        onOpenChange={setCalculatorOpen}
        trigger={null}
      />

      {/* 隐藏的周报导出节点 */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none opacity-0">
        <WeeklyExport id="toolbox-weekly-export-node" />
      </div>

      {/* 导出结果弹窗 */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg p-0 overflow-hidden bg-background border-border">
          <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-border bg-muted/30">
            <DialogTitle>{t.exportWeekly}</DialogTitle>
          </DialogHeader>
          <div className="relative aspect-[3/5] max-h-[70vh] w-full overflow-hidden flex items-center justify-center p-4 sm:p-6 bg-muted/10">
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
              size="sm"
              onClick={() => setIsExportDialogOpen(false)}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
