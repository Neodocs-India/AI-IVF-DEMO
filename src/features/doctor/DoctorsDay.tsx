import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCheck, ClipboardCopy, Share2, Sparkles } from 'lucide-react';
import type { Appointment, Patient } from '@/data/types';
import { useDemo } from '@/store/demo';
import { HERO_IDS } from '@/data/heroes';
import { AI_DISCLAIMER } from '@/data/scripts';
import * as S from '@/lib/selectors';
import { greeting, longDate } from '@/lib/format';
import { summaryAsText, summaryFor } from '@/lib/summary';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Panel } from '@/components/Panel';
import { RiskBadge } from '@/components/Badges';
import { TypedSummary } from './TypedSummary';
import { FriendlySummaryDialog } from './FriendlySummaryDialog';

const DOCTORS = [
  { id: 'anil-mehta', label: 'Dr. Anil Mehta' },
  { id: 'shruti-kulkarni', label: 'Dr. Shruti Kulkarni' },
];

export default function DoctorsDay() {
  const patients = useDemo((s) => s.patients);
  const appointments = useDemo((s) => s.appointments);
  const priyaBooked = appointments.some((a) => a.patientId === HERO_IDS.priya);
  const [doctor, setDoctor] = useState('anil-mehta');
  const list = useMemo(() => S.consultsToday(appointments.filter((a) => a.doctorId === doctor)), [appointments, doctor]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    // Default to Priya once booked, otherwise the next consult after 09:10
    if (selected && list.some((a) => a.id === selected)) return;
    const priya = list.find((a) => a.patientId === HERO_IDS.priya);
    setSelected((priya ?? list.find((a) => a.time >= '09:10') ?? list[0])?.id ?? null);
  }, [list, selected]);

  const byId = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const appt = list.find((a) => a.id === selected);
  const patient = appt ? byId.get(appt.patientId) : undefined;

  // Build the day, with Dr. Mehta's open 16:30 slot until the navigator books it
  const rows: (Appointment | { open: true; time: string })[] = [...list];
  if (doctor === 'anil-mehta' && !priyaBooked) rows.push({ open: true, time: '16:30' });
  rows.sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{greeting()}, {doctor === 'anil-mehta' ? 'Dr. Mehta' : 'Dr. Kulkarni'}</h1>
          <p className="mt-1 text-sm text-slate">Doctor’s Day · {longDate()} · <span className="num">{list.length}</span> consults</p>
        </div>
        <div className="flex items-center gap-1 text-xs">
          {DOCTORS.map((d) => (
            <button key={d.id} type="button" onClick={() => { setDoctor(d.id); setSelected(null); }} className={cn('rounded px-2.5 py-1.5', doctor === d.id ? 'bg-ink text-white' : 'text-slate hover:bg-paper')}>{d.label}</button>
          ))}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
        <div className="space-y-6">
          <section className="rounded border border-line bg-paper" data-tour="consult-list">
            <h2 className="border-b border-line px-5 py-3 text-sm font-semibold">Today’s consults</h2>
            <ol>
              {rows.map((r) =>
                'open' in r ? (
                  <li key="open" className="grid grid-cols-[52px_1fr] gap-3 border-b border-line px-5 py-3 last:border-0">
                    <span className="num text-sm text-slate">{r.time}</span>
                    <span className="text-sm text-slate-400">Open slot</span>
                  </li>
                ) : (
                  <ConsultRow key={r.id} a={r} p={byId.get(r.patientId)!} active={r.id === selected} onSelect={() => setSelected(r.id)} />
                ),
              )}
            </ol>
          </section>
          {doctor === 'anil-mehta' && <SidePanels patients={patients} />}
        </div>

        <div className="xl:sticky xl:top-24 xl:self-start">
          {appt && patient ? <SummaryPanel key={appt.id} a={appt} p={patient} /> : <Panel><p className="text-sm text-slate">Select a consult to see the pre-consultation summary.</p></Panel>}
        </div>
      </div>
    </div>
  );
}

function ConsultRow({ a, p, active, onSelect }: { a: Appointment; p: Patient; active: boolean; onSelect: () => void }) {
  const isNew = a.patientId === HERO_IDS.priya;
  return (
    <li className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={onSelect}
        data-tour={isNew ? 'priya-consult' : undefined}
        className={cn('grid w-full grid-cols-[52px_1fr] gap-3 px-5 py-3 text-left transition-colors', active ? 'bg-lagoon-50' : 'hover:bg-mist', isNew && !active && 'bg-saffron-50/60')}
      >
        <span className={cn('num text-sm', active ? 'font-semibold text-ink' : 'text-slate')}>{a.time}</span>
        <span className="min-w-0">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate font-serif text-base text-ink">{p.name}</span>
            <span className="shrink-0 text-xs text-slate">{a.visitType}</span>
          </span>
          <span className="mt-0.5 flex gap-1.5 text-xs leading-5 text-slate">
            <Sparkles className="mt-1 h-3 w-3 shrink-0 text-lagoon" />
            <span>{a.brief}</span>
          </span>
          {isNew && <span className="mt-1 inline-block rounded bg-saffron/15 px-1.5 py-px text-[11px] font-medium text-[#9A6A12]">Booked today by Sneha Pawar</span>}
        </span>
      </button>
    </li>
  );
}

function SummaryPanel({ a, p }: { a: Appointment; p: Patient }) {
  const seen = useDemo((s) => s.summariesSeen.includes(a.id));
  const reviewed = useDemo((s) => s.summariesReviewed.includes(a.id));
  const markSeen = useDemo((s) => s.markSummarySeen);
  const markReviewed = useDemo((s) => s.markSummaryReviewed);
  const toast = useDemo((s) => s.toast);
  const [shareOpen, setShareOpen] = useState(false);
  const [typing] = useState(!seen);
  const summary = useMemo(() => summaryFor(p, a), [p, a]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summaryAsText(summary) + `\n\n${AI_DISCLAIMER}`);
    } catch {
      /* clipboard may be unavailable during recording; the toast still confirms */
    }
    toast('Copied to EMR note.', 'positive');
  };

  return (
    <article className="rounded border border-line bg-paper" data-tour="ai-summary">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-8 py-3">
        <div className="flex items-center gap-2 text-xs text-slate">
          <Sparkles className="h-3.5 w-3.5 text-lagoon" /> Pre-consultation summary · {a.time} · <Link to={`/patients/${p.id}`} className="text-lagoon hover:underline">Open record</Link>
        </div>
        <RiskBadge score={p.risk.score} band={p.risk.band} size="sm" />
      </header>
      <div className="px-8 py-7 md:px-12">
        <TypedSummary summary={summary} animate={typing} onDone={() => markSeen(a.id)} />
      </div>
      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-8 py-4">
        <Button variant="secondary" onClick={copy}><ClipboardCopy /> Copy to EMR note</Button>
        <Button variant={reviewed ? 'ghost' : 'secondary'} onClick={() => { markReviewed(a.id); toast('Summary marked reviewed.', 'positive'); }} disabled={reviewed}>
          <CheckCheck /> {reviewed ? 'Reviewed by Dr. Mehta' : 'Mark reviewed'}
        </Button>
        <Button onClick={() => setShareOpen(true)}><Share2 /> Share patient-friendly summary</Button>
      </footer>
      <FriendlySummaryDialog patient={p} open={shareOpen} onOpenChange={setShareOpen} />
    </article>
  );
}

function SidePanels({ patients }: { patients: Patient[] }) {
  const decisions = S.decisionTasks(patients);
  const flagged = patients.filter((p) => p.consultantId === 'anil-mehta' && S.isActive(p) && p.risk.score >= 70).sort((a, b) => b.risk.score - a.risk.score);
  const byId = new Map(patients.map((p) => [p.id, p]));
  return (
    <>
      <Panel title="Needs your decision" meta={`${decisions.length} items`}>
        <ul className="space-y-2.5">
          {decisions.map((t) => {
            const p = byId.get(t.patientId)!;
            return (
              <li key={t.id} className="text-sm">
                <Link to={`/patients/${p.id}`} className="font-serif text-[15px] text-ink hover:text-lagoon">{p.name}</Link>
                <div className="text-xs text-slate">{t.title}{t.note ? ` · ${t.note}` : ''}</div>
              </li>
            );
          })}
        </ul>
      </Panel>
      <Panel title="Flagged patients in your panel" meta="High dropout risk">
        <ul className="space-y-2">
          {flagged.slice(0, 8).map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0">
                <Link to={`/patients/${p.id}`} className="font-serif text-[15px] text-ink hover:text-lagoon">{p.name}</Link>
                <span className="block truncate text-xs text-slate">{S.isOverdueNow(p) ? S.reasonFor(p) : p.risk.factors[0]?.label}</span>
              </span>
              <RiskBadge score={p.risk.score} band={p.risk.band} showBand={false} size="sm" />
            </li>
          ))}
        </ul>
      </Panel>
    </>
  );
}
