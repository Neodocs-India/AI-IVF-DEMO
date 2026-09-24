import { AnimatePresence, motion } from 'framer-motion';
import type { RiskAssessment } from '@/data/types';
import { cn } from '@/lib/utils';

/** Factor bars: each factor's contribution to the dropout-risk score. */
export function RiskFactors({ risk, compact }: { risk: RiskAssessment; compact?: boolean }) {
  const max = Math.max(30, ...risk.factors.map((f) => Math.abs(f.weight)));
  const barTone = risk.band === 'High' ? 'bg-rose/70' : risk.band === 'Moderate' ? 'bg-saffron' : 'bg-sage/70';
  return (
    <ul className={cn('space-y-2.5', compact && 'space-y-2')}>
      <AnimatePresence initial={false}>
        {risk.factors.map((f) => (
          <motion.li
            key={f.label}
            layout
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-[1fr_120px_36px] items-center gap-3 text-sm"
          >
            <span className="text-ink">{f.label}</span>
            <span className="relative h-2 rounded-full bg-mist">
              <motion.span
                className={cn('absolute inset-y-0 rounded-full', f.weight < 0 ? 'right-1/2 bg-sage' : 'left-0', f.weight >= 0 && barTone)}
                initial={{ width: 0 }}
                animate={{ width: f.weight < 0 ? `${(Math.abs(f.weight) / max) * 50}%` : `${(f.weight / max) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              />
            </span>
            <span className={cn('num text-right text-sm', f.weight < 0 ? 'font-medium text-sage' : 'text-ink')}>
              {f.weight > 0 ? `+${f.weight}` : `−${Math.abs(f.weight)}`}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
