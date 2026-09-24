import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import type { CryoItem, Patient } from '@/data/types';
import { useDemo } from '@/store/demo';
import * as S from '@/lib/selectors';
import { daysSince, daysUntil, fmtDate, fmtDuration } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { Sheet } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SourceChip, StageChip } from '@/components/Badges';
import { Panel, Empty } from '@/components/Panel';
import { UnreachableLog } from '@/features/patient-360/Patient360';

type FilterId = 'all' | 'nofet' | 'renewal' | 'unreachable' | 'fee' | 'fp';
const FILTERS: { id: FilterId; label: string; test: (p: Patient) => boolean }[] = [
  { id: 'nofet', label: 'No FET plan > 6 months', test: S.isNoFetPlan6m },
  { id: 'renewal', label: 'Renewal due ≤ 60 days', test: S.isRenewalDue60 },
  { id: 'unreachable', label: 'Unreachable', test: S.isUnreachable },
  { id: 'fee', label: 'Fee overdue', test: S.isFeeOverdue },
  { id: 'fp', label: 'Fertility preservation', test: S.isFertilityPreservation },
];

interface Row {
  key: string;
  patient: Patient;
  kind: CryoItem['kind'];
  items: CryoItem[];
  count: number;
}

const KIND_LABEL = (k: CryoItem['kind'], n: number) => (k === 'Embryo' ? (n === 1 ? 'embryo' : 'embryos') : k === 'Oocytes' ? 'oocytes' : n === 1 ? 'sperm sample' : 'sperm samples');

export default function CryoRegister() {
  const patients = useDemo((s) => s.patients);
  const [params, setParams] = useSearchParams();
  const filter = (params.get('filter') as FilterId) || 'all';
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const m = useMemo(() => S.cryoMetrics(patients), [patients]);
  const cryoPatients = useMemo(() => S.cryoPatients(patients), [patients]);

  const rows = useMemo(() => {
    const f = FILTERS.find((x) => x.id === filter);
    const list = cryoPatients.filter((p) => (!f || f.test(p)) && (!q || p.name.toLowerCase().includes(q.toLowerCase()) || p.id.toLowerCase().includes(q.toLowerCase())));
    const out: Row[] = [];
    for (const p of list) {
      for (const kind of ['Embryo', 'Oocytes', 'Sperm'] as const) {
        const items = p.cryo.filter((c) => c.kind === kind);
        if (!items.length) continue;
        if (filter === 'fp' && kind !== 'Oocytes') continue;
        if (filter === 'nofet' && kind !== 'Embryo') continue;
        out.push({ key: `${p.id}-${kind}`, patient: p, kind, items, count: items.reduce((s, c) => s + c.count, 0) });
      }
    }
    const first = (r: Row) => r.items.map((c) => c.storageRenewalDue).sort()[0]!;
    return out.sort((a, b) => Number(S.isUnreachable(b.patient)) - Number(S.isUnreachable(a.patient)) || first(a).localeCompare(first(b)));
  }, [cryoPatients, filter, q]);

  const setFilter = (id: FilterId) => setParams(id === 'all' ? {} : { filter: id }, { replace: true });
  const counts = Object.fromEntries(FILTERS.map((f) => [f.id, cryoPatients.filter(f.test).length])) as Record<FilterId, number>;
  const selectedPatient = open ? patients.find((p) => p.id === open) : undefined;

  const tiles: { label: string; value: number; sub?: string; filter?: FilterId; tone?: 'attention' }[] = [
    { label: 'Patients with stored material', value: m.patients },
    { label: 'Embryos in storage', value: m.embryos },
    { label: 'Oocytes in storage', value: m.oocytes, sub: `from ${m.oocytePatients} patients`, filter: 'fp' },
    { label: 'Sperm samples', value: m.sperm },
    { label: 'Embryos, no FET plan > 6 months', value: m.noFetPlan, sub: 'patients', filter: 'nofet', tone: 'attention' },
    { label: 'Renewals due in 60 days', value: m.renewals60, sub: 'patients', filter: 'renewal', tone: 'attention' },
    { label: 'Unreachable', value: m.unreachable, sub: '≥ 3 failed attempts', filter: 'unreachable', tone: 'attention' },
  ];

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Cryo-Storage Register</h1>
        <p className="mt-1 text-sm text-slate">Every stored embryo, oocyte and sperm sample, with renewal, consent and follow-up status. Read from the cryo register and IVF software.</p>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded border border-line bg-line sm:grid-cols-4 xl:grid-cols-7" data-tour="cryo-tiles">
        {tiles.map((t) => (
          <button
            key={t.label}
            type="button"
            disabled={!t.filter}
            onClick={() => t.filter && setFilter(filter === t.filter ? 'all' : t.filter)}
            className={cn('bg-paper px-4 py-3 text-left transition-colors', t.filter && 'hover:bg-mist', filter === t.filter && 'bg-lagoon-50')}
          >
            <div className={cn('num text-xl font-semibold', t.tone === 'attention' ? 'text-[#9A6A12]' : 'text-ink')}>{t.value}</div>
            <div className="text-xs leading-4 text-ink">{t.label}</div>
            {t.sub && <div className="text-xs text-slate">{t.sub}</div>}
          </button>
        ))}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => setFilter('all')} className={cn('rounded-full border px-3 py-1 text-xs', filter === 'all' ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink hover:border-line-strong')}>All</button>
            {FILTERS.map((f) => (
              <button key={f.id} type="button" onClick={() => setFilter(f.id)} className={cn('num rounded-full border px-3 py-1 text-xs', filter === f.id ? 'border-ink bg-ink text-white' : 'border-line bg-paper text-ink hover:border-line-strong')}>
                {f.label} ({counts[f.id]})
              </button>
            ))}
            <label className="relative ml-auto">
              <span className="sr-only">Search register</span>
              <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-slate" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or ID" className="h-8 w-52 rounded border border-line bg-paper pl-8 pr-2 text-sm focus:border-lagoon focus:outline-none focus-visible:ring-0" />
            </label>
          </div>

          <div className="overflow-x-auto rounded border border-line bg-paper">
            <table className="w-full min-w-[1040px] text-sm">
              <thead className="sticky top-0 bg-paper">
                <tr className="border-b border-line text-left text-xs text-slate">
                  {['Patient', 'Material', 'Grade / day', 'Frozen on · stored for', 'Location', 'Renewal due', 'Consent until', 'Fee', 'Last contact · attempts', 'Disposition'].map((h) => (
                    <th key={h} className={cn('px-3 py-2 font-normal', h === 'Patient' && 'pl-5')}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const it = r.items[0]!;
                  const renewal = r.items.map((c) => c.storageRenewalDue).sort()[0]!;
                  const frozen = r.items.map((c) => c.frozenOn).sort()[0]!;
                  const attempts = Math.max(...r.items.map((c) => c.contactAttempts));
                  const grades = r.kind === 'Embryo' ? r.items.map((c) => c.grade).join(', ') : r.kind === 'Oocytes' ? 'MII' : '—';
                  return (
                    <tr key={r.key} onClick={() => setOpen(r.patient.id)} className="cursor-pointer border-b border-line last:border-0 hover:bg-mist/70" data-tour={r.patient.id === 'P-18244' ? 'kavita-row' : undefined}>
                      <td className="py-2.5 pl-5 pr-3">
                        <div className="font-serif text-[15px] text-ink">{r.patient.name}</div>
                        <div className="text-xs text-slate">{r.patient.id}</div>
                      </td>
                      <td className="num px-3"><span className="font-semibold">{r.count}</span> {KIND_LABEL(r.kind, r.count)}</td>
                      <td className="max-w-[130px] px-3 text-xs">{grades}{r.kind === 'Embryo' && it.dayFrozen ? ` · d${it.dayFrozen}` : ''}</td>
                      <td className="num px-3"><div>{fmtDate(frozen)}</div><div className="text-xs text-slate">{fmtDuration(daysSince(frozen))}</div></td>
                      <td className="whitespace-nowrap px-3 text-xs">{it.tank.replace('Tank ', 'T')} · {it.canister} · cane {it.cane}</td>
                      <td className={cn('num px-3', daysUntil(renewal) <= 60 && 'font-medium text-[#9A6A12]')}>{fmtDate(renewal)}</td>
                      <td className="num px-3">{fmtDate(it.consentValidUntil)}</td>
                      <td className={cn('px-3', it.feeStatus === 'Overdue' ? 'font-medium text-rose' : it.feeStatus === 'Due' ? 'text-[#9A6A12]' : 'text-sage')}>{it.feeStatus}</td>
                      <td className="num px-3"><div>{fmtDate(it.lastContactOn)}</div><div className={cn('text-xs', attempts >= 3 ? 'font-semibold text-rose' : 'text-slate')}>{attempts} attempt{attempts === 1 ? '' : 's'}</div></td>
                      <td className="px-3 text-xs">{it.disposition}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!rows.length && <Empty>No stored material matches this filter.</Empty>}
          </div>
          <p className="num mt-2 text-xs text-slate">{rows.length} rows · {new Set(rows.map((r) => r.patient.id)).size} patients</p>
        </div>

        <TankMap patients={cryoPatients} highlight={selectedPatient} />
      </div>

      <Sheet
        open={!!selectedPatient}
        onOpenChange={(o) => !o && setOpen(null)}
        width={560}
        title={selectedPatient && <h2 className="font-serif text-xl font-medium">{selectedPatient.name}</h2>}
        description={selectedPatient && <span>{selectedPatient.id} · {selectedPatient.partner ? `with ${selectedPatient.partner.name} · ` : ''}<StageChip stage={selectedPatient.stage} /></span>}
      >
        {selectedPatient && <CryoDrawer p={selectedPatient} />}
      </Sheet>
    </div>
  );
}

function CryoDrawer({ p }: { p: Patient }) {
  const toast = useDemo((s) => s.toast);
  const unreachable = S.isUnreachable(p);
  return (
    <div className="space-y-5 px-6 py-5">
      {unreachable ? (
        <UnreachableLog p={p} />
      ) : (
        <Panel title="Contact and decisions">
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-slate">Last contact</dt><dd className="num">{fmtDate(p.cryo[0]!.lastContactOn)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Contact attempts since</dt><dd className="num">{p.cryo[0]!.contactAttempts}</dd></div>
            <div className="flex justify-between"><dt className="text-slate">Disposition</dt><dd>{p.cryo[0]!.disposition}</dd></div>
          </dl>
        </Panel>
      )}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Stored material <SourceChip source="Cryo register" /></h3>
        <ul className="divide-y divide-line rounded border border-line">
          {p.cryo.map((c) => (
            <li key={c.id} className="px-4 py-3 text-sm">
              <div className="flex justify-between gap-3">
                <span><span className="num font-semibold">{c.count}</span> {KIND_LABEL(c.kind, c.count)}{c.grade ? ` · ${c.grade}` : ''}</span>
                <span className="text-slate">{c.tank}, Canister {c.canister}, Cane {c.cane}</span>
              </div>
              <div className="num mt-1 text-xs text-slate">Frozen {fmtDate(c.frozenOn)} · renewal due {fmtDate(c.storageRenewalDue)} · consent until {fmtDate(c.consentValidUntil)} · fee {c.feeStatus.toLowerCase()}</div>
            </li>
          ))}
        </ul>
      </div>
      {!unreachable && (
        <p className="rounded bg-mist px-3 py-2 text-xs text-slate">No disposition action without documented consent. Storage limits and consent follow ART (Regulation) Act, 2021 and clinic policy.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {unreachable ? (
          <Button onClick={() => toast(`Contact attempt 4 logged for ${p.name}: alternate number.`, 'info')}>Log contact attempt</Button>
        ) : (
          <Button onClick={() => toast(`Storage renewal reminder sent to ${p.name}.`, 'positive')}>Send renewal reminder</Button>
        )}
        <Button variant="secondary" asChild><Link to={`/patients/${p.id}?tab=storage`}>Open full record</Link></Button>
      </div>
    </div>
  );
}

function TankMap({ patients, highlight }: { patients: Patient[]; highlight?: Patient }) {
  const CANISTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const CAPACITY = 14; // devices per canister
  const occ = new Map<string, number>();
  for (const p of patients) for (const c of p.cryo) occ.set(`${c.tank}|${c.canister}`, (occ.get(`${c.tank}|${c.canister}`) ?? 0) + 1);
  const hl = new Set(highlight?.cryo.map((c) => `${c.tank}|${c.canister}`) ?? []);
  const tanks = ['Tank 1', 'Tank 2', 'Tank 3', 'Tank 4'];
  return (
    <Panel title="Tank map" meta="Storage devices per canister" className="2xl:self-start">
      <div className="grid grid-cols-4 gap-3 2xl:grid-cols-2">
        {tanks.map((t) => {
          const used = CANISTERS.reduce((s, c) => s + (occ.get(`${t}|${c}`) ?? 0), 0);
          return (
            <div key={t}>
              <div className="mb-1.5 flex items-baseline justify-between text-xs">
                <span className="font-medium text-ink">{t}</span>
                <span className="num text-slate">{Math.round((used / (CAPACITY * 6)) * 100)}%</span>
              </div>
              <svg viewBox="0 0 100 100" className="w-full" role="img" aria-label={`${t}: ${used} devices`}>
                <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#C5D0D5" strokeWidth="1.5" />
                {CANISTERS.map((c, i) => {
                  const n = occ.get(`${t}|${c}`) ?? 0;
                  const a0 = (i / 6) * Math.PI * 2 - Math.PI / 2;
                  const a1 = ((i + 1) / 6) * Math.PI * 2 - Math.PI / 2;
                  const r = 44;
                  const ri = 16;
                  const pt = (a: number, rr: number) => `${50 + rr * Math.cos(a)} ${50 + rr * Math.sin(a)}`;
                  const d = `M ${pt(a0 + 0.03, ri)} L ${pt(a0 + 0.03, r)} A ${r} ${r} 0 0 1 ${pt(a1 - 0.03, r)} L ${pt(a1 - 0.03, ri)} A ${ri} ${ri} 0 0 0 ${pt(a0 + 0.03, ri)} Z`;
                  const fill = Math.min(1, n / CAPACITY);
                  const mid = (a0 + a1) / 2;
                  const isHl = hl.has(`${t}|${c}`);
                  return (
                    <g key={c}>
                      <path d={d} fill={isHl ? '#D9971E' : `rgba(13,115,119,${0.08 + fill * 0.72})`} stroke={isHl ? '#9A6A12' : '#FFFFFF'} strokeWidth={isHl ? 1.5 : 1}>
                        <title>{`${t}, Canister ${c}: ${n} of ${CAPACITY} devices`}</title>
                      </path>
                      <text x={50 + 31 * Math.cos(mid)} y={50 + 31 * Math.sin(mid) + 3} textAnchor="middle" className={cn('text-[8px] font-semibold', fill > 0.55 || isHl ? 'fill-white' : 'fill-ink')}>{c}</text>
                    </g>
                  );
                })}
                <circle cx="50" cy="50" r="12" fill="#F3F6F7" />
              </svg>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate">Darker segments are fuller. {highlight ? <span className="text-[#9A6A12]">Highlighted: {highlight.name}’s canister.</span> : 'Select a row to locate it.'}</p>
    </Panel>
  );
}
