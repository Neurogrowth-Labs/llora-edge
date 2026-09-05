import React from 'react';
import {
  Activity,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Clock,
  AlertCircle,
  Radio,
  WifiOff,
} from 'lucide-react';
import { DataState } from '../types/architecture';

export interface DataStateBadgeProps {
  state: DataState;
  label?: string;
  sublabel?: string;
  showIcon?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  pulse?: boolean;
  timestamp?: string;
  tooltip?: string;
  className?: string;
  onClick?: () => void;
}

const STATE_CONFIGS: Record<
  DataState,
  {
    label: string;
    defaultDesc: string;
    icon: React.ComponentType<{ className?: string }>;
    bgClass: string;
    borderClass: string;
    textClass: string;
    dotClass: string;
    glowClass: string;
  }
> = {
  LIVE: {
    label: 'LIVE',
    defaultDesc: 'Currently receiving data stream',
    icon: Radio,
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    textClass: 'text-emerald-400',
    dotClass: 'bg-emerald-400',
    glowClass: 'shadow-[0_0_8px_rgba(16,185,129,0.3)]',
  },
  SYNCED: {
    label: 'SYNCED',
    defaultDesc: 'Data synchronized successfully',
    icon: CheckCircle2,
    bgClass: 'bg-cyan-500/10',
    borderClass: 'border-cyan-500/30',
    textClass: 'text-cyan-400',
    dotClass: 'bg-cyan-400',
    glowClass: 'shadow-[0_0_8px_rgba(6,182,212,0.25)]',
  },
  ESTIMATED: {
    label: 'ESTIMATED',
    defaultDesc: 'Calculated or AI-generated estimate',
    icon: Sparkles,
    bgClass: 'bg-amber-500/10',
    borderClass: 'border-amber-500/30',
    textClass: 'text-amber-400',
    dotClass: 'bg-amber-400',
    glowClass: 'shadow-[0_0_8px_rgba(245,158,11,0.25)]',
  },
  VERIFIED: {
    label: 'VERIFIED',
    defaultDesc: 'Human/system verified',
    icon: ShieldCheck,
    bgClass: 'bg-indigo-500/10',
    borderClass: 'border-indigo-500/30',
    textClass: 'text-indigo-400',
    dotClass: 'bg-indigo-400',
    glowClass: 'shadow-[0_0_8px_rgba(99,102,241,0.25)]',
  },
  STALE: {
    label: 'STALE',
    defaultDesc: 'Data has not been updated recently',
    icon: Clock,
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/30',
    textClass: 'text-yellow-400',
    dotClass: 'bg-yellow-400',
    glowClass: 'shadow-[0_0_8px_rgba(234,179,8,0.2)]',
  },
  ERROR: {
    label: 'ERROR',
    defaultDesc: 'Data source unavailable',
    icon: AlertCircle,
    bgClass: 'bg-rose-500/10',
    borderClass: 'border-rose-500/30',
    textClass: 'text-rose-400',
    dotClass: 'bg-rose-400',
    glowClass: 'shadow-[0_0_8px_rgba(244,63,94,0.3)]',
  },
};

export const DataStateBadge: React.FC<DataStateBadgeProps> = ({
  state,
  label,
  sublabel,
  showIcon = true,
  size = 'sm',
  pulse = true,
  timestamp,
  tooltip,
  className = '',
  onClick,
}) => {
  const config = STATE_CONFIGS[state] || STATE_CONFIGS.SYNCED;
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[9px] gap-1',
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3 py-1.5 text-sm gap-2.5',
  }[size];

  const iconSizes = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  const displayTooltip = tooltip || `${config.label}: ${config.defaultDesc}${timestamp ? ` (${timestamp})` : ''}`;

  return (
    <span
      onClick={onClick}
      title={displayTooltip}
      className={`inline-flex items-center rounded-full font-mono font-bold uppercase tracking-wider border transition-all select-none ${
        config.bgClass
      } ${config.borderClass} ${config.textClass} ${sizeClasses} ${className} ${
        onClick ? 'cursor-pointer hover:brightness-125' : ''
      }`}
    >
      {/* Live Pulsing Dot for LIVE / ERROR */}
      {pulse && (state === 'LIVE' || state === 'ERROR') ? (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${config.dotClass}`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${config.dotClass}`}
          />
        </span>
      ) : showIcon ? (
        <IconComponent className={`${iconSizes} shrink-0`} />
      ) : (
        <span className={`inline-block w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      )}

      <span>{label || config.label}</span>

      {sublabel && (
        <span className="text-[9px] font-normal opacity-75 lowercase tracking-normal">
          • {sublabel}
        </span>
      )}

      {timestamp && (
        <span className="text-[8px] font-mono opacity-60 font-normal ml-0.5">
          [{timestamp}]
        </span>
      )}
    </span>
  );
};
