import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { StageId } from '@/data/types';
import { STAGES, TREATMENT_LABEL, staffById } from '@/data/constants';
import { useDemo } from '@/store/demo';
import * as S from '@/lib/selectors';
import { relativeDays } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { RiskBadge, StageChip } from '@/components/Badges';
import { Empty } from '@/components/Panel';

export default function Directory() {
  const patients = useDemo((s) => s.patients);
  const [params, setParams] = useSearchParams();
  const risk = params.get('risk');
  const stage = (params.get('stage') as StageId | null) ?? '';
  const [q, setQ] = useState(params.get('q') ?? '');
  const [limit, setLimit] = useState(60);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return patients
      .filter((p) => (risk === 'high' ? S.isActive(p) && p.risk.score >= 70 : true))
      .filter((p) => (stage ? p.stage === stage : true))
      .filter((p) => !term || p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term) || p.partner?.name.toLowerCase().includes(term) || p.phoneMasked.replace(/\D/g, '').endsWith(term.replace(/\D/g, '') || '§'))
      .sort((a, b) => b.risk.score - a.risk.score);
  }, [patients, risk, stage, q]);

  const set = (k: string, v: string | null) => setParams((prev) => { const n = new URLSearchParams(prev); if (v) n.set(k, v); else n.delete(k); return n; }, { replace: true });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Patients</h1>
        <p className="num mt-1 text-sm text-slate">{patients.length} patients on record · {S.activePatients(patients).length} active</p>
      </header>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <label className="relative">
          <span className="sr-only">Search patients</span>
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, partner, ID or last digits of phone" className="h-9 w-80 rounded border border-line bg-paper pl-8 pr-2 text-sm focus:border-lagoon focus:outline-none focus-visible:ring-0" />
        </label>
        <select value={stage} onChange={(e) => set('stage', e.target.value || null)} className="h-9 rounded border border-line bg-paper px-2 text-sm">
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
        <button type="button" onClick={() => set('risk', risk === 'high' ? null : 'high')} className={cn('h-9 rounded border px-3 text-sm', risk === 'high' ? 'border-rose/40 bg-rose/10 text-rose' : 'border-line bg-paper text-ink hover:border-line-strong')}>
          High dropout risk only
        </button>
        <span className="num ml-auto text-xs text-slate">{rows.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded border border-line bg-paper">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-slate">
              <th className="py-2 pl-5 pr-3 font-normal">Patient</th>
              <th className="px-3 py-2 font-normal">Stage</th>
              <th className="px-3 py-2 font-normal">Treatment</th>
              <th className="px-3 py-2 font-normal">Consultant</th>
              <th className="px-3 py-2 font-normal">Navigator</th>
              <th className="px-3 py-2 font-normal">Last contact</th>
              <th className="px-3 py-2 font-normal">Follow-up</th>
              <th className="px-5 py-2 font-normal">Risk</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(0, limit).map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-mist/70">
                <td className="py-2.5 pl-5 pr-3">
                  <Link to={`/patients/${p.id}`} className="font-serif text-[15px] text-ink hover:text-lagoon">{p.name}</Link>
                  <div className="text-xs text-slate">{p.id}{p.partner ? ` · with ${p.partner.name.split(' ')[0]}` : ''} · {p.locality}</div>
                </td>
                <td className="px-3"><StageChip stage={p.stage} /></td>
                <td className="px-3 text-slate">{TREATMENT_LABEL[p.treatmentType]}</td>
                <td className="px-3 text-slate">{staffById(p.consultantId).name}</td>
                <td className="px-3 text-slate">{staffById(p.navigatorId).name}</td>
                <td className="num px-3 text-slate">{p.lastContactOn ? relativeDays(p.lastContactOn) : '—'}</td>
                <td className="px-3">{S.isOverdueNow(p) ? <span className="num text-xs font-medium text-[#9A6A12]">Overdue {p.overdueDays} d</span> : <span className="text-xs text-slate">On track</span>}</td>
                <td className="px-5"><RiskBadge score={p.risk.score} band={p.risk.band} size="sm" /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <Empty>No patients match.</Empty>}
        {rows.length > limit && (
          <div className="border-t border-line px-5 py-3 text-center">
            <button type="button" onClick={() => setLimit((l) => l + 100)} className="text-sm text-lagoon hover:underline">Show more ({rows.length - limit} more)</button>
          </div>
        )}
      </div>
    </div>
  );
}
