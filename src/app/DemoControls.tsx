import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertOctagon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useDemo } from '@/store/demo';
import { useUi } from '@/store/ui';
import { HERO_IDS } from '@/data/heroes';
import { OHSS_BANNER } from '@/data/scripts';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { TOUR } from './tour';

const isTyping = (el: EventTarget | null) => {
  const t = el as HTMLElement | null;
  if (!t) return false;
  const tag = t.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || t.isContentEditable;
};

/** Keyboard triggers for recording — §10.2. Never fire while typing. */
export function useDemoKeys() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
      const s = useDemo.getState();
      switch (e.key) {
        case 'b': case 'B': s.triggerBeta(); break;
        case 'o': case 'O': s.triggerOhss(); break;
        case 'a': case 'A': s.triggerAnjali(); break;
        case 'r': case 'R': s.reset(); break;
        case 't': case 'T': s.setTour({ open: !s.tour.open }); break;
        case '?': s.setShortcutsOpen(!s.shortcutsOpen); break;
        default: return;
      }
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

export function CriticalBanner() {
  const ohss = useDemo((s) => s.flags.ohss && !s.flags.ohssDismissed);
  const dismiss = useDemo((s) => s.dismissOhss);
  const role = useUi((s) => s.role);
  const { pathname } = useLocation();
  const show = ohss && role !== 'patient' && pathname !== '/patient-app';
  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden" role="alert">
          <div className="flex items-center gap-3 bg-rose px-6 py-3 text-sm text-white">
            <AlertOctagon className="h-5 w-5 shrink-0" />
            <p className="flex-1 font-medium">{OHSS_BANNER}</p>
            <Button size="sm" asChild className="bg-white text-rose hover:bg-rose-50">
              <Link to={`/patients/${HERO_IDS.pooja}?tab=messages`}>Open record</Link>
            </Button>
            <button type="button" onClick={dismiss} className="rounded p-1 hover:bg-white/15" aria-label="Hide banner"><X className="h-4 w-4" /></button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

const SHORTCUTS: [string, string][] = [
  ['B', 'Beta result arrives for Fatima Shaikh'],
  ['O', 'Critical OHSS alert for Pooja Reddy'],
  ['A', 'Anjali Nair misses her 08:30 scan'],
  ['R', 'Reset the demo'],
  ['T', 'Show or hide the guided tour'],
  ['?', 'Show this panel'],
];

export function ShortcutsPanel() {
  const open = useDemo((s) => s.shortcutsOpen);
  const setOpen = useDemo((s) => s.setShortcutsOpen);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent title="Keyboard shortcuts" description="For recording. They do not fire while typing in a field.">
        <ul className="divide-y divide-line px-6 py-2">
          {SHORTCUTS.map(([k, label]) => (
            <li key={k} className="flex items-center gap-4 py-2.5 text-sm">
              <kbd className="flex h-7 w-7 items-center justify-center rounded border border-line-strong bg-mist font-sans text-xs font-semibold text-ink">{k}</kbd>
              {label}
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}

export function GuidedTour() {
  const tour = useDemo((s) => s.tour);
  const setTour = useDemo((s) => s.setTour);
  const setRole = useUi((s) => s.setRole);
  const navigate = useNavigate();
  const step = TOUR[tour.step]!;

  // Soft outline around the step's target
  useEffect(() => {
    if (!tour.open || !step.target) return;
    let el: Element | null = null;
    let tries = 0;
    const id = setInterval(() => {
      el = document.querySelector(`[data-tour="${step.target}"]`);
      if (el || ++tries > 40) {
        clearInterval(id);
        if (el) {
          el.classList.add('tour-highlight');
          el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
      }
    }, 100);
    return () => {
      clearInterval(id);
      document.querySelectorAll('.tour-highlight').forEach((x) => x.classList.remove('tour-highlight'));
    };
  }, [tour.open, tour.step, step.target]);

  const go = (i: number) => {
    const s = TOUR[i]!;
    setTour({ step: i });
    if (s.role) setRole(s.role);
    navigate(s.to);
  };

  if (!tour.open) return null;
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-6 right-6 z-[55] w-[320px] rounded border border-line bg-paper shadow-pop">
      <div className="flex items-start justify-between gap-2 px-4 pt-3">
        <div>
          <div className="num text-xs text-slate">Step {tour.step + 1} of {TOUR.length} — {step.title}</div>
          <p className="mt-1 text-sm text-ink">{step.hint}</p>
        </div>
        <button type="button" onClick={() => setTour({ open: false })} className="rounded p-1 text-slate hover:bg-mist" aria-label="Close tour"><X className="h-4 w-4" /></button>
      </div>
      <div className="mt-3 flex items-center gap-1 px-4 pb-3">
        {TOUR.map((_, i) => <span key={i} className={i === tour.step ? 'h-1 w-4 rounded-full bg-lagoon' : 'h-1 w-1.5 rounded-full bg-line-strong'} />)}
        <div className="ml-auto flex gap-1">
          <Button size="sm" variant="ghost" disabled={tour.step === 0} onClick={() => go(tour.step - 1)}><ChevronLeft /> Previous</Button>
          <Button size="sm" disabled={tour.step === TOUR.length - 1} onClick={() => go(tour.step + 1)}>Next <ChevronRight /></Button>
        </div>
      </div>
    </motion.div>
  );
}
