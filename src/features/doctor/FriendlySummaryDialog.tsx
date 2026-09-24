import { useState } from 'react';
import type { Patient } from '@/data/types';
import { HERO_IDS } from '@/data/heroes';
import { AI_DISCLAIMER, PRIYA_FRIENDLY } from '@/data/scripts';
import { useDemo } from '@/store/demo';
import { staffById } from '@/data/constants';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FriendlySummaryDialog({ patient, open, onOpenChange }: { patient: Patient; open: boolean; onOpenChange: (o: boolean) => void }) {
  const toast = useDemo((s) => s.toast);
  const isPriya = patient.id === HERO_IDS.priya;
  const [lang, setLang] = useState<'English' | 'Marathi'>(isPriya ? 'Marathi' : 'English');
  const first = patient.name.split(' ')[0];
  const generic = `${first}${patient.partner ? ` and ${patient.partner.name.split(' ')[0]}` : ''}, thank you for coming in today. ${staffById(patient.consultantId).name} has gone over your results and the next step with you. If anything is unclear, or you would like to talk about how you are feeling or about costs, our team is here for you. You can message us on this number any time.`;
  const text = isPriya ? PRIYA_FRIENDLY[lang] : generic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title="Patient-friendly summary" description={`For ${patient.name}${patient.partner ? ` and ${patient.partner.name}` : ''} · plain language, no medical jargon`}>
        <div className="px-6 py-5">
          {isPriya && (
            <div className="mb-4 flex items-center gap-1 text-xs">
              {(['Marathi', 'English'] as const).map((l) => (
                <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded px-2.5 py-1', lang === l ? 'bg-ink text-white' : 'text-slate hover:bg-mist')}>{l}</button>
              ))}
              {lang === 'Marathi' && <span className="ml-2 text-slate">Translation marked for native-speaker review</span>}
            </div>
          )}
          <p lang={lang === 'Marathi' ? 'mr' : 'en'} className={cn('rounded bg-mist px-5 py-4 text-[17px] leading-8 text-ink', lang === 'Marathi' && isPriya ? 'font-deva' : 'font-serif')}>
            {text}
          </p>
          <p className="mt-3 text-xs italic text-slate">{AI_DISCLAIMER}</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => { onOpenChange(false); toast(`Patient-friendly summary sent to ${first} on WhatsApp.`, 'positive'); }}>Send on WhatsApp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
