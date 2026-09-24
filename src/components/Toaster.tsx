import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { useDemo } from '@/store/demo';
import { cn } from '@/lib/utils';

export function Toaster() {
  const toasts = useDemo((s) => s.toasts);
  const dismiss = useDemo((s) => s.dismissToast);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[60] flex -translate-x-1/2 flex-col items-center gap-2" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = t.tone === 'positive' ? CheckCircle2 : t.tone === 'critical' ? AlertTriangle : Info;
          return (
            <motion.button
              key={t.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={() => dismiss(t.id)}
              className="pointer-events-auto flex max-w-xl items-center gap-3 rounded bg-ink px-4 py-3 text-left text-sm text-white shadow-pop"
            >
              <Icon className={cn('h-4 w-4 shrink-0', t.tone === 'positive' ? 'text-sage-100' : t.tone === 'critical' ? 'text-rose-100' : 'text-lagoon-100')} />
              {t.text}
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
