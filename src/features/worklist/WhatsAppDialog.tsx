import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { Patient } from '@/data/types';
import { useDemo } from '@/store/demo';
import { ruleById } from '@/lib/selectors';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function WhatsAppDialog({ patient, open, onOpenChange }: { patient: Patient; open: boolean; onOpenChange: (o: boolean) => void }) {
  const send = useDemo((s) => s.sendWhatsApp);
  const first = patient.name.split(' ')[0];
  const sensitive = ruleById(patient.overdueRuleId)?.sensitive;
  const [text, setText] = useState('');
  useEffect(() => {
    if (open) setText(sensitive ? `Hello ${first}, this is ${patient.navigatorId === 'sneha-pawar' ? 'Sneha' : 'Imran'} from Aarambh Fertility Centre. I wanted to check in on you personally. Would it be all right if I called you today?` : `Hello ${first}, this is Aarambh Fertility Centre. Would you like us to book your next visit? Reply with a day that suits you.`);
  }, [open, sensitive, first, patient.navigatorId]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent title={`Send WhatsApp — ${patient.name}`} description={`Sent from the clinic's WhatsApp Business number · ${patient.phoneMasked}`}>
        <div className="space-y-4 px-6 py-5">
          {sensitive && (
            <div className="flex gap-2 rounded border border-saffron/40 bg-saffron-50 px-3 py-2 text-xs text-ink">
              <ShieldAlert className="h-4 w-4 shrink-0 text-saffron" />
              Sensitive period ({patient.overdueRuleId}). Automated nudges are paused; this message is sent personally by the navigator. A call is preferred.
            </div>
          )}
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} className="w-full rounded border border-line px-3 py-2 font-serif text-[15px] leading-6 focus:border-lagoon focus:outline-none focus-visible:ring-0" />
        </div>
        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { send(patient.id, text); onOpenChange(false); }}>Send WhatsApp</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
