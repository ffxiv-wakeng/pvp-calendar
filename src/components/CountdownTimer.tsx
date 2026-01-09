import { useState, useEffect } from 'react';
import { formatTimeRemaining } from '@/lib/rotation';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetTime: Date;
  onExpire?: () => void;
  className?: string;
  compact?: boolean;
}

export function CountdownTimer({ targetTime, onExpire, className, compact = false }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(() => 
    targetTime.getTime() - Date.now()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = targetTime.getTime() - Date.now();
      setTimeRemaining(remaining);
      
      if (remaining <= 0) {
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onExpire]);

  const { hours, minutes, seconds } = formatTimeRemaining(timeRemaining);

  if (compact) {
    return (
      <div className={cn("font-mono text-2xl sm:text-3xl font-bold text-primary tabular-nums", className)}>
        {String(hours).padStart(2, '0')}
        <span className="text-xl text-muted-foreground/60">:</span>
        {String(minutes).padStart(2, '0')}
        <span className="text-xl text-muted-foreground/60">:</span>
        {String(seconds).padStart(2, '0')}
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-1 font-mono", className)}>
      <TimeUnit value={hours} />
      <span className="text-xl text-muted-foreground">:</span>
      <TimeUnit value={minutes} />
      <span className="text-xl text-muted-foreground">:</span>
      <TimeUnit value={seconds} />
    </div>
  );
}

function TimeUnit({ value }: { value: number }) {
  return (
    <span className="text-2xl sm:text-3xl font-bold text-primary tabular-nums">
      {String(value).padStart(2, '0')}
    </span>
  );
}
