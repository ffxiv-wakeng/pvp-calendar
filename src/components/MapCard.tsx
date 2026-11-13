import { useState, useEffect, useRef } from 'react';
import { FrontlineMap, CCMap } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { cn } from '@/lib/utils';

interface MapCardProps {
  mapId: FrontlineMap | CCMap;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showFullName?: boolean;
  eager?: boolean;
  className?: string;
  nameClasses?: string;
}

const mapGradients: Record<string, string> = {
  secure: 'from-amber-800 to-stone-700',
  seize: 'from-slate-700 to-blue-800',
  shatter: 'from-cyan-800 to-blue-900',
  naadam: 'from-emerald-800 to-teal-900',
  triumph: 'from-sky-800 to-indigo-900',
  palaistra: 'from-orange-800 to-amber-900',
  volcanic: 'from-red-800 to-orange-900',
  castletown: 'from-violet-800 to-indigo-900',
  bayside: 'from-sky-700 to-blue-800',
  cloudnine: 'from-indigo-700 to-violet-900',
  redsands: 'from-rose-800 to-red-900',
  harmonias: 'from-teal-800 to-slate-900',
};

export function MapCard({
  mapId,
  size = 'md',
  showName = true,
  showFullName = true,
  eager = false,
  className,
  nameClasses = '',
}: MapCardProps) {
  const { t } = useSettingsContext();
  const mapName = showFullName
    ? t.maps[mapId as keyof typeof t.maps]
    : t.mapShort[mapId as keyof typeof t.mapShort];
  const imagePath = `./maps/${mapId}.webp`;

  const imgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(eager);
  const [failed, setFailed] = useState(false);

  // 切换地图时同步重置并检查缓存完成状态，防止图片闪烁或卡在透明态
  useEffect(() => {
    setFailed(false);
    if (eager || imgRef.current?.complete) {
      setLoaded(true);
    } else {
      setLoaded(false);
    }
  }, [imagePath, eager]);

  const sizeClasses = {
    sm: 'max-w-[260px]',
    md: 'max-w-[360px]',
    lg: 'max-w-[460px]',
  };

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden rounded-lg mx-auto select-none border border-border/40',
        'bg-gradient-to-br',
        mapGradients[mapId] || 'from-slate-800 to-slate-900',
        sizeClasses[size],
        className
      )}
      style={{ aspectRatio: '376/120' }}
    >
      {!failed && (
        <img
          ref={imgRef}
          src={imagePath}
          alt={mapName}
          className={cn(
            'absolute inset-0 w-full h-full object-cover transition-opacity duration-200',
            loaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />

      {showName && (
        <div className={cn('absolute bottom-0 left-0 right-0 p-3 sm:p-4', nameClasses)}>
          <h3 className="text-white font-semibold text-sm sm:text-base drop-shadow-md line-clamp-2 text-balance">
            {mapName}
          </h3>
        </div>
      )}
    </div>
  );
}

export function MapBadge({ mapId, className }: { mapId: FrontlineMap | CCMap; className?: string }) {
  const { t } = useSettingsContext();
  const shortName = t.mapShort[mapId as keyof typeof t.mapShort];

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] sm:text-xs font-medium',
        'bg-primary/12 text-primary border border-primary/25',
        className
      )}
    >
      {shortName}
    </span>
  );
}
