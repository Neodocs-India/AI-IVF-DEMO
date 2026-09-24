import type { RiskAssessment, SourceSystem, StageId } from '@/data/types';
import { stageById } from '@/data/constants';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';

const BAND = {
  Low: 'bg-sage/10 text-sage',
  Moderate: 'bg-saffron/[0.12] text-[#9A6A12]',
  High: 'bg-rose/10 text-rose',
} as const;

export function RiskBadge({ score, band, size = 'md', showBand = true, animate = false }: { score: number; band: RiskAssessment['band']; size?: 'sm' | 'md' | 'lg'; showBand?: boolean; animate?: boolean }) {
  return (
    <span
      className={cn(
        'num inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-medium transition-colors duration-700',
        BAND[band],
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-2.5 py-0.5 text-xs',
        size === 'lg' && 'px-3 py-1 text-sm',
      )}
    >
      <span className="font-semibold">{animate ? <AnimatedNumber value={score} duration={1.2} /> : score}</span>
      {showBand && <span className="opacity-90">{band}</span>}
    </span>
  );
}

export function TrendIcon({ trend }: { trend: RiskAssessment['trend'] }) {
  const Icon = trend === 'Rising' ? TrendingUp : trend === 'Falling' ? TrendingDown : Minus;
  return (
    <span className={cn('inline-flex items-center gap-1 text-xs', trend === 'Rising' ? 'text-rose' : trend === 'Falling' ? 'text-sage' : 'text-slate')}>
      <Icon className="h-3.5 w-3.5" /> {trend}
    </span>
  );
}

export function StageChip({ stage, className }: { stage: StageId; className?: string }) {
  const s = stageById(stage);
  return (
    <span className={cn('inline-flex whitespace-nowrap rounded border border-line bg-mist px-1.5 py-0.5 text-xs text-ink', className)} title={s.description}>
      {s.label}
    </span>
  );
}

const SOURCE_TONE: Record<SourceSystem, string> = {
  EMR: 'text-[#3D5A80]',
  'IVF software': 'text-lagoon',
  Lab: 'text-[#6B4E9B]',
  Billing: 'text-[#8A6A1F]',
  WhatsApp: 'text-sage',
  Anvaya: 'text-ink',
  'Cryo register': 'text-[#2F6F8F]',
};

/** Small provenance chip: shows which clinic system a data point came from. */
export function SourceChip({ source, date, className }: { source: SourceSystem; date?: string; className?: string }) {
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-sm border border-line bg-paper px-1 py-px align-middle font-sans text-[11px] leading-4', SOURCE_TONE[source], className)}>
      <span className="h-1 w-1 rounded-full bg-current opacity-70" />
      {source}
      {date && <span className="text-slate">· {date}</span>}
    </span>
  );
}

export function PriorityTag({ priority }: { priority: 'Critical' | 'High' | 'Normal' }) {
  if (priority === 'Normal') return <span className="text-xs text-slate">Normal</span>;
  return (
    <span className={cn('inline-flex rounded px-1.5 py-0.5 text-xs font-medium', priority === 'Critical' ? 'bg-rose text-white' : 'bg-saffron/15 text-[#9A6A12]')}>
      {priority}
    </span>
  );
}
