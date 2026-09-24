import { useEffect, useState } from 'react';
import type { Patient } from '@/data/types';
import { useDemo, type CallInput } from '@/store/demo';
import { HERO_IDS } from '@/data/heroes';
import { PRIYA_CALL_NOTES, PRIYA_CALL_STEPS } from '@/data/scripts';
import { staffById } from '@/data/constants';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const OUTCOMES: CallInput['outcome'][] = ['Reached patient', 'No answer', 'Call back requested', 'Wrong number'];

export function CallDialog({ patient, open, onOpenChange }: { patient: Patient; open: boolean; onOpenChange: (o: boolean) => void }) {
  const logCall = useDemo((s) => s.logCall);
  const scripted = patient.id === HERO_IDS.priya && patient.isOverdue;
  const [outcome, setOutcome] = useState<CallInput['outcome']>('Reached patient');
  const [notes, setNotes] = useState('');
  const [steps, setSteps] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setOutcome('Reached patient');
    setNotes(scripted ? PRIYA_CALL_NOTES : '');
    setSteps(scripted ? PRIYA_CALL_STEPS.map((s) => s.id) : []);
  }, [open, scripted]);

  const toggle = (id: string) => setSteps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const save = () => {
    logCall(patient.id, { outcome, notes, steps });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Log call — ${patient.name}`} description={`${staffById(patient.navigatorId).name} · ${patient.phoneMasked} · ${patient.language}`}>
        <div className="space-y-5 px-6 py-5">
          <fieldset>
            <legend className="mb-2 text-xs text-slate">Outcome</legend>
            <div className="flex flex-wrap gap-2">
              {OUTCOMES.map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={cn('rounded border px-3 py-1.5 text-sm', outcome === o ? 'border-lagoon bg-lagoon-50 text-ink' : 'border-line text-slate hover:border-line-strong')}
                >
                  {o}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block">
            <span className="mb-2 block text-xs text-slate">Notes</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={5}
              placeholder="What did the patient say? What was agreed?"
              className="w-full resize-y rounded border border-line px-3 py-2 font-serif text-[15px] leading-6 text-ink focus:border-lagoon focus:outline-none focus-visible:ring-0"
            />
          </label>
          {scripted && (
            <fieldset>
              <legend className="mb-2 text-xs text-slate">Next steps</legend>
              <div className="space-y-2">
                {PRIYA_CALL_STEPS.map((s) => (
                  <label key={s.id} className="flex cursor-pointer items-center gap-3 text-sm text-ink">
                    <input type="checkbox" checked={steps.includes(s.id)} onChange={() => toggle(s.id)} className="h-4 w-4 rounded border-line accent-lagoon" />
                    {s.label}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={save} data-tour="save-call">Save and complete</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
