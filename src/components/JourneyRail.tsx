import { motion, useReducedMotion } from 'framer-motion';
import type { StageId } from '@/data/types';
import { ACTIVE_STAGES, stageById } from '@/data/constants';
import { cn } from '@/lib/utils';
import { AnimatedNumber } from './AnimatedNumber';

// Signature element — CLAUDE.md §9.4. One horizontal line with stage nodes;
// node size encodes volume; overdue counts sit as saffron marks under each node.

const MAIN = ACTIVE_STAGES.filter((s) => !s.side);
const SIDE = ACTIVE_STAGES.filter((s) => s.side);

export function PipelineRail({
  counts,
  onSelect,
  selected,
  animateIn,
  onAnimated,
}: {
  counts: Record<StageId, { total: number; overdue: number }>;
  onSelect: (stage: StageId) => void;
  selected?: StageId | null;
  animateIn: boolean;
  onAnimated?: () => void;
}) {
  const reduce = useReducedMotion();
  const play = animateIn && !reduce;
  const max = Math.max(...ACTIVE_STAGES.map((s) => counts[s.id].total));
  const radius = (n: number) => 7 + Math.sqrt(n / max) * 15;

  const node = (id: StageId, label: string, i: number, side = false) => {
    const short = stageById(id).shortLabel;
    const c = counts[id];
    const r = radius(c.total);
    const isSel = selected === id;
    const marks = Math.min(c.overdue, 8);
    return (
      <button
        key={id}
        type="button"
        onClick={() => onSelect(id)}
        data-tour={id === 'review_after_negative' ? 'rail-review' : undefined}
        className={cn('group relative flex min-w-0 flex-1 flex-col items-center rounded px-0.5 pb-2 pt-1 text-center transition-colors', isSel ? 'bg-lagoon-50' : 'hover:bg-mist')}
        aria-label={`${label}: ${c.total} patients, ${c.overdue} overdue`}
      >
        <span className={cn('num text-xl font-semibold leading-none tracking-tight', side ? 'text-ink-600' : 'text-ink')}>
          {play ? <AnimatedNumber value={c.total} from={0} duration={1.1 + i * 0.05} /> : <AnimatedNumber value={c.total} />}
        </span>
        <span className="relative mt-3 flex h-[46px] w-full items-center justify-center">
          <motion.span
            initial={play ? { scale: 0, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            onAnimationComplete={i === 11 ? onAnimated : undefined}
            className={cn(
              'relative z-10 rounded-full border-2 transition-colors',
              side ? 'border-slate-400 bg-paper' : 'border-lagoon bg-lagoon',
              isSel && 'ring-4 ring-lagoon/20',
            )}
            style={{ width: r * 2, height: r * 2, background: side ? undefined : `rgba(13,115,119,${0.25 + (c.total / max) * 0.75})` }}
          />
        </span>
        <span className="mt-2 line-clamp-2 min-h-[32px] text-xs leading-4 text-ink">
          <span className="hidden xl:inline">{label}</span>
          <span className="xl:hidden">{short}</span>
        </span>
        <span className="mt-1.5 flex h-4 items-center gap-[3px]" aria-hidden>
          {Array.from({ length: marks }).map((_, k) => (
            <motion.span
              key={k}
              initial={play ? { opacity: 0, y: 3 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 + i * 0.05 + k * 0.03 }}
              className="h-2.5 w-[3px] rounded-full bg-saffron"
            />
          ))}
        </span>
        <span className={cn('num h-4 text-xs', c.overdue ? 'font-medium text-[#9A6A12]' : 'text-slate-400')}>
          {c.overdue ? <><AnimatedNumber value={c.overdue} /><span className="hidden xl:inline"> overdue</span></> : <><span className="hidden xl:inline">On track</span><span className="xl:hidden">—</span></>}
        </span>
      </button>
    );
  };

  return (
    <div className="relative">
      <div className="flex items-stretch gap-2">
        {/* Main path */}
        <div className="relative flex min-w-0 flex-[10] items-start">
          <span aria-hidden className="absolute left-[4%] right-[4%] top-[64px] h-[2px] bg-lagoon/35" />
          {MAIN.map((s, i) => node(s.id, s.id === 'transfer_luteal' ? 'Transfer & luteal' : s.label, i))}
        </div>
        {/* Side stages, set apart */}
        <div className="relative flex min-w-0 flex-[2.4] items-start border-l border-dashed border-line-strong pl-2">
          <span aria-hidden className="absolute left-[10%] right-[10%] top-[64px] h-0 border-t-2 border-dashed border-slate-300" />
          {SIDE.map((s, i) => node(s.id, s.label, MAIN.length + i, true))}
        </div>
      </div>
    </div>
  );
}
