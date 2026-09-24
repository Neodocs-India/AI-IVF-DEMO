import { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import type { FollowUpRule, OwnerRole } from '@/data/types';
import { stageById } from '@/data/constants';
import { useDemo } from '@/store/demo';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Sheet } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ROLES: OwnerRole[] = ['Navigator', 'Nurse', 'Doctor', 'Counsellor', 'Embryologist', 'Front desk'];

export default function FollowUpRules() {
  const rules = useDemo((s) => s.rules);
  const update = useDemo((s) => s.updateRule);
  const toast = useDemo((s) => s.toast);
  const [open, setOpen] = useState<string | null>(null);
  const rule = rules.find((r) => r.id === open);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Follow-up Rules</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate">Rules decide when a patient needs follow-up, who gets the task, and when it escalates. Sensitive rules never send automated messages: a person makes contact.</p>
      </header>

      <div className="overflow-x-auto rounded border border-line bg-paper">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-slate">
              <th className="py-2 pl-5 pr-3 font-normal">On</th>
              <th className="px-3 py-2 font-normal">Rule</th>
              <th className="px-3 py-2 font-normal">Stage</th>
              <th className="px-3 py-2 font-normal">Threshold</th>
              <th className="px-3 py-2 font-normal">Owner</th>
              <th className="px-3 py-2 font-normal">Escalation</th>
              <th className="px-3 py-2 font-normal">Sensitive</th>
              <th className="px-5 py-2 text-right font-normal">Fired, last 30 days</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id} onClick={() => setOpen(r.id)} className={cn('cursor-pointer border-b border-line last:border-0 hover:bg-mist/70', !r.enabled && 'text-slate')}>
                <td className="py-3 pl-5 pr-3" onClick={(e) => e.stopPropagation()}>
                  <Switch checked={r.enabled} onCheckedChange={(v) => { update(r.id, { enabled: v }); toast(`${r.id} ${v ? 'turned on' : 'turned off'}.`); }} aria-label={`Turn ${r.id} ${r.enabled ? 'off' : 'on'}`} />
                </td>
                <td className="px-3"><span className="num mr-2 text-xs text-slate">{r.id}</span><span className="text-ink">{r.name}</span></td>
                <td className="px-3 text-slate">{stageById(r.stage).label}</td>
                <td className="num px-3">{thresholdText(r)}</td>
                <td className="px-3">{r.ownerRole}</td>
                <td className="px-3 text-slate">{r.escalateTo} after {r.escalateAfterDays} {r.escalateAfterDays === 1 ? 'day' : 'days'}</td>
                <td className="px-3">{r.sensitive ? <span className="inline-flex items-center gap-1 text-xs text-ink"><ShieldAlert className="h-3.5 w-3.5 text-saffron" />Human contact only</span> : <span className="text-xs text-slate">No</span>}</td>
                <td className="num px-5 text-right">{r.firedLast30Days}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Sheet open={!!rule} onOpenChange={(o) => !o && setOpen(null)} width={560} title={rule && <h2 className="text-lg font-semibold">{rule.id} · {rule.name}</h2>} description="Changes apply to this demo only.">
        {rule && <RuleEditor rule={rule} onSave={(patch) => { update(rule.id, patch); toast(`${rule.id} saved.`, 'positive'); setOpen(null); }} />}
      </Sheet>
    </div>
  );
}

function thresholdText(r: FollowUpRule) {
  if (r.id === 'R-05' || r.id === 'R-09' || r.id === 'R-13' || r.id === 'R-12') return r.thresholdLabel;
  return `${r.thresholdDays} ${r.thresholdDays === 1 ? 'day' : 'days'}`;
}

function RuleEditor({ rule, onSave }: { rule: FollowUpRule; onSave: (patch: Partial<FollowUpRule>) => void }) {
  const [draft, setDraft] = useState(rule);
  useEffect(() => setDraft(rule), [rule]);
  const set = (patch: Partial<FollowUpRule>) => setDraft((d) => ({ ...d, ...patch }));
  const num = 'num mx-1 w-14 rounded border border-line-strong bg-paper px-1.5 py-0.5 text-center font-semibold text-ink focus:border-lagoon focus:outline-none focus-visible:ring-0';
  const sel = 'mx-1 rounded border border-line-strong bg-paper px-1.5 py-0.5 font-semibold text-ink focus:border-lagoon focus:outline-none focus-visible:ring-0';
  const dayRule = !['R-05', 'R-09', 'R-12', 'R-13'].includes(rule.id);
  return (
    <div className="px-6 py-6">
      <p className="font-serif text-lg leading-10 text-ink">
        When a patient has been in <strong className="font-semibold">{stageById(rule.stage).label}</strong>
        {dayRule ? (
          <> for more than <input type="number" min={0} className={num} value={draft.thresholdDays} onChange={(e) => set({ thresholdDays: +e.target.value })} /> days</>
        ) : (
          <> ({rule.thresholdLabel})</>
        )}{' '}
        with {rule.condition}, create a task for the
        <select className={sel} value={draft.ownerRole} onChange={(e) => set({ ownerRole: e.target.value as OwnerRole })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>.
        Escalate to the
        <select className={sel} value={draft.escalateTo} onChange={(e) => set({ escalateTo: e.target.value as OwnerRole })}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select>
        after <input type="number" min={0} className={num} value={draft.escalateAfterDays} onChange={(e) => set({ escalateAfterDays: +e.target.value })} /> more days.
        {draft.sensitive && <strong className="font-semibold"> Sensitive: human contact only.</strong>}
      </p>
      <div className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
        <label className="flex items-center justify-between gap-4">
          <span>
            <span className="block text-ink">Sensitive</span>
            <span className="text-xs text-slate">No automated nudges. The owner contacts the patient personally.</span>
          </span>
          <Switch checked={draft.sensitive} onCheckedChange={(v) => set({ sensitive: v })} />
        </label>
        <label className="flex items-center justify-between gap-4">
          <span className="text-ink">Rule is on</span>
          <Switch checked={draft.enabled} onCheckedChange={(v) => set({ enabled: v })} />
        </label>
        <p className="num text-xs text-slate">Fired {rule.firedLast30Days} times in the last 30 days.</p>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <Button variant="ghost" onClick={() => setDraft(rule)}>Undo changes</Button>
        <Button onClick={() => onSave(draft)}>Save rule</Button>
      </div>
    </div>
  );
}
