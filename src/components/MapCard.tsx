import { FrontlineMap, CCMap } from '@/lib/rotation';
import { useSettingsContext } from '@/contexts/useSettingsContext';
import { cn } from '@/lib/utils';

interface MapCardProps {
  mapId: FrontlineMap | CCMap;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  showFullName?: boolean;
  className?: string;
}

const mapGradients: Record<string, string> = {
  secure: 'from-amber-800 to-stone-700',
  seize: 'from-slate-700 to-blue-800',
  shatter: 'from-cyan-800 to-blue-900',
  naadam: 'from-emerald-800 to-teal-900',
  palaistra: 'from-orange-800 to-amber-900',
  volcanic: 'from-red-800 to-orange-900',
  castletown: 'from-violet-800 to-indigo-900',
  bayside: 'from-sky-700 to-blue-800',
  cloudnine: 'from-indigo-700 to-violet-900',
  redsands: 'from-rose-800 to-red-900',
};

export function MapCard({ mapId, size = 'md', showName = true, showFullName = false, className }: MapCardProps) {
  const { t } = useSettingsContext();
  const mapName = showFullName ? t.maps[mapId as keyof typeof t.maps] : t.maps[mapId as keyof typeof t.maps];
  
  const sizeClasses = {
    sm: 'h-16 sm:h-20',
    md: 'h-24 sm:h-28',
    lg: 'h-28 sm:h-36',
  };

  const imagePath = `./maps/${mapId}.webp`;

  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-lg mx-auto select-none",
        "bg-gradient-to-br",
        mapGradients[mapId],
        sizeClasses[size],
        className
      )}
      style={{ aspectRatio: '376/120' }}
    >
      <img 
        src={imagePath}
        alt={mapName}
        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity"
        onLoad={(e) => {
          (e.target as HTMLImageElement).style.opacity = '1';
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      
      {showName && (
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
          <h3 className="text-white font-semibold text-sm sm:text-base drop-shadow-lg line-clamp-2">
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
    <span className={cn(
      "inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium",
      "bg-primary/15 text-primary border border-primary/25",
      className
    )}>
      {shortName}
    </span>
  );
}
