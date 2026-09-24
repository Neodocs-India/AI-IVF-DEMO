import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, ClipboardCheck, Siren, Snowflake, Stethoscope } from 'lucide-react';
import { useDemo } from '@/store/demo';
import { CLINIC, STAFF, stageById } from '@/data/constants';
import type { StageId } from '@/data/types';
import * as S from '@/lib/selectors';
import { formatCrore, formatINR, greeting, longDate } from '@/lib/format';
import { daysSince } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { PipelineRail } from '@/components/JourneyRail';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Panel } from '@/components/Panel';
import { Avatar } from '@/components/Avatar';
import { RiskBadge, StageChip } from '@/components/Badges';
import { Sheet, Dialog, DialogContent } from '@/components/ui/dialog';
import { PatientName } from '@/components/PatientLink';
import { useUi } from '@/store/ui';
import { roleById } from '@/app/roles';

export default function CommandCentre() {
  const patients = useDemo((s) => s.patients);
  const appointments = useDemo((s) => s.appointments);
  const schedule = useDemo((s) => s.schedule);
  const animated = useDemo((s) => s.flags.pipelineAnimated);
  const setAnimated = useDemo((s) => s.setPipelineAnimated);
  const role = useUi((s) => roleById(s.role));
  const [stage, setStage] = useState<StageId | null>(null);
  const [valueOpen, setValueOpen] = useState(false);
  // Play the settle-in animation once per session (§9.5)
  const [playIntro] = useState(!animated);

  const m = useMemo(() => {
    const overdue = S.overduePatients(patients);
    return {
      overdue: overdue.length,
      highRisk: S.highRiskPatients(patients).length,
      value: S.valueAtRisk(patients),
      valuePatients: S.valueAtRiskPatients(patients),
      counts: S.stageCounts(patients),
      dueToday: S.dueTodayTasks(patients).length,
      critical: S.criticalTasks(patients),
      cryo: S.cryoMetrics(patients),
      decisions: S.decisionTasks(patients),
      team: S.teamLoad(patients),
      active: S.activePatients(patients).length,
    };
  }, [patients]);

  const name = role.id === 'director' || role.id === 'doctor' ? 'Dr. Mehta' : role.greetingName;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">
          {greeting()}, {name}
        </h1>
        <p className="mt-1 text-sm text-slate">
          {longDate()} · {CLINIC.name}, {CLINIC.area}
        </p>
      </header>

      {/* 1. Attention strip */}
      <p data-tour="attention" className="max-w-5xl border-l-[3px] border-saffron pl-4 text-lg leading-8 text-ink">
        <Link to="/worklist?tab=overdue" className="num font-semibold underline decoration-saffron decoration-2 underline-offset-4 hover:text-lagoon">
          <AnimatedNumber value={m.overdue} /> patients
        </Link>{' '}
        are overdue for follow-up,{' '}
        <Link to="/patients?risk=high" className="num font-semibold underline decoration-rose/60 decoration-2 underline-offset-4 hover:text-lagoon">
          <AnimatedNumber value={m.highRisk} />
        </Link>{' '}
        are at high risk of dropping out, and{' '}
        <button type="button" onClick={() => setValueOpen(true)} className="num font-semibold underline decoration-lagoon/50 decoration-2 underline-offset-4 hover:text-lagoon">
          {formatCrore(m.value)}
        </button>{' '}
        of planned treatment is waiting.
      </p>

      {/* 2. Journey pipeline */}
      <section className="rounded border border-line bg-paper px-5 pb-4 pt-4" data-tour="pipeline">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold">Where every patient is today</h2>
          <p className="num text-xs text-slate">
            {m.active} active patients · select a stage to see who is in it
          </p>
        </div>
        <PipelineRail counts={m.counts} onSelect={setStage} selected={stage} animateIn={playIntro} onAnimated={setAnimated} />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <TodayPanel consults={appointments} schedule={schedule.length} dueToday={m.dueToday} critical={m.critical.length} />
        <DecisionsPanel decisions={m.decisions} />
        <CryoPanel cryo={m.cryo} />
      </div>

      <TeamLoad team={m.team} />

      <StageSheet stage={stage} onClose={() => setStage(null)} />
      <ValueDialog open={valueOpen} onOpenChange={setValueOpen} total={m.value} />
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, to, tone }: { icon: typeof Stethoscope; label: string; value: number; sub?: React.ReactNode; to: string; tone?: 'critical' }) {
  return (
    <Link to={to} className="group flex items-start gap-3 py-3 first:pt-0 last:pb-0">
      <Icon className={cn('mt-0.5 h-4 w-4', tone === 'critical' && value > 0 ? 'text-rose' : 'text-slate')} />
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-ink group-hover:text-lagoon">{label}</span>
          <span className={cn('num text-lg font-semibold', tone === 'critical' && value > 0 ? 'text-rose' : 'text-ink')}>
            <AnimatedNumber value={value} />
          </span>
        </div>
        {sub && <div className="text-xs text-slate">{sub}</div>}
      </div>
    </Link>
  );
}

function TodayPanel({ consults, schedule, dueToday, critical }: { consults: { doctorId: string }[]; schedule: number; dueToday: number; critical: number }) {
  const mehta = consults.filter((c) => c.doctorId === 'anil-mehta').length;
  return (
    <Panel title="Today" meta="Monday 12 October">
      <div className="divide-y divide-line">
        <Stat icon={Stethoscope} label="Consults" value={consults.length} sub={`Dr. Mehta ${mehta} · Dr. Kulkarni ${consults.length - mehta}`} to="/doctor" />
        <Stat icon={CalendarClock} label="Scans and procedures" value={schedule} sub="Follicle scans, OPU, embryo transfers, beta hCG" to="/worklist?tab=today" />
        <Stat icon={ClipboardCheck} label="Tasks due today" value={dueToday} to="/worklist?tab=today" />
        <Stat icon={Siren} label="Critical alerts" value={critical} sub={critical ? 'Needs action now' : 'None right now'} to="/worklist?tab=critical" tone="critical" />
      </div>
    </Panel>
  );
}

function DecisionsPanel({ decisions }: { decisions: ReturnType<typeof S.decisionTasks> }) {
  const patients = useDemo((s) => s.patients);
  const groups: { label: (n: number) => string; items: typeof decisions }[] = [
    { label: (n: number) => `${n} treatment plan${n === 1 ? '' : 's'} awaiting approval`, items: decisions.filter((d) => d.kind === 'plan_approval') },
    { label: (n: number) => `${n} FET timing decision${n === 1 ? '' : 's'}`, items: decisions.filter((d) => d.kind === 'fet_timing') },
    { label: (n: number) => `${n} result${n === 1 ? '' : 's'} to call the patient about`, items: decisions.filter((d) => d.kind === 'clinical') },
  ].filter((g) => g.items.length);
  return (
    <Panel title="Needs your decision" meta="Dr. Anil Mehta">
      <ul className="space-y-4">
        {groups.map((g) => (
          <li key={g.items[0]!.kind}>
            <div className="num text-sm font-medium text-ink">{g.label(g.items.length)}</div>
            <ul className="mt-1.5 space-y-1">
              {g.items.map((t) => {
                const p = patients.find((x) => x.id === t.patientId)!;
                return (
                  <li key={t.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <Link to={`/patients/${p.id}`} className="truncate font-serif text-ink hover:text-lagoon">{p.name}</Link>
                    <span className="shrink-0 text-xs text-slate">{t.title.split(':')[1]?.trim() ?? stageById(p.stage).label}</span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function CryoPanel({ cryo }: { cryo: ReturnType<typeof S.cryoMetrics> }) {
  const rows = [
    { label: 'Embryos with no FET plan for over 6 months', value: cryo.noFetPlan, unit: 'patients', to: '/cryo?filter=nofet' },
    { label: 'Storage renewals due in the next 60 days', value: cryo.renewals60, unit: 'patients', to: '/cryo?filter=renewal' },
    { label: 'Unreachable after 3 or more attempts', value: cryo.unreachable, unit: 'patients', to: '/cryo?filter=unreachable' },
  ];
  return (
    <Panel title="Cryo-storage" meta={<span className="num">{cryo.embryos} embryos, {cryo.oocytes} oocytes and {cryo.sperm} sperm samples stored for {cryo.patients} patients</span>} action={<Snowflake className="h-4 w-4 text-slate" />}>
      <ul className="divide-y divide-line">
        {rows.map((r) => (
          <li key={r.label}>
            <Link to={r.to} className="group flex items-baseline justify-between gap-4 py-3 first:pt-0">
              <span className="text-sm text-ink group-hover:text-lagoon">{r.label}</span>
              <span className="num text-lg font-semibold text-ink">{r.value}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function TeamLoad({ team }: { team: ReturnType<typeof S.teamLoad> }) {
  const people = STAFF.filter((s) => team.has(s.id));
  const max = Math.max(...people.map((p) => team.get(p.id)!.open));
  return (
    <Panel title="Team load" meta="Open tasks by person" bodyClassName="px-0 py-0">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-slate">
            <th className="px-5 py-2 font-normal">Person</th>
            <th className="px-3 py-2 text-right font-normal">Open</th>
            <th className="px-3 py-2 text-right font-normal">Due today</th>
            <th className="px-3 py-2 text-right font-normal">Overdue</th>
            <th className="w-[35%] px-5 py-2 font-normal"><span className="sr-only">Load</span></th>
          </tr>
        </thead>
        <tbody>
          {people.map((s) => {
            const r = team.get(s.id)!;
            return (
              <tr key={s.id} className="border-b border-line last:border-0">
                <td className="px-5 py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} tone={s.tone} size={26} />
                    <div className="leading-tight">
                      <div className="text-ink">{s.name}</div>
                      <div className="text-xs text-slate">{s.title}</div>
                    </div>
                  </div>
                </td>
                <td className="num px-3 text-right">{r.open}</td>
                <td className="num px-3 text-right">{r.dueToday}</td>
                <td className={cn('num px-3 text-right', r.overdue ? 'font-medium text-[#9A6A12]' : 'text-slate')}>{r.overdue}</td>
                <td className="px-5">
                  <div className="flex h-2 overflow-hidden rounded-full bg-mist">
                    <div className="bg-saffron" style={{ width: `${(r.overdue / max) * 100}%` }} />
                    <div className="bg-lagoon/60" style={{ width: `${((r.open - r.overdue) / max) * 100}%` }} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

function StageSheet({ stage, onClose }: { stage: StageId | null; onClose: () => void }) {
  const patients = useDemo((s) => s.patients);
  const list = useMemo(() => (stage ? S.patientsInStage(patients, stage) : []), [patients, stage]);
  const def = stage ? stageById(stage) : null;
  return (
    <Sheet
      open={!!stage}
      onOpenChange={(o) => !o && onClose()}
      width={520}
      title={<h2 className="text-lg font-semibold">{def?.label}</h2>}
      description={def && <span className="num">{list.length} patients · {list.filter(S.isOverdueNow).length} overdue · {def.description}</span>}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-paper">
          <tr className="border-b border-line text-left text-xs text-slate">
            <th className="px-6 py-2 font-normal">Patient</th>
            <th className="px-2 py-2 text-right font-normal">Days in stage</th>
            <th className="px-6 py-2 text-right font-normal">Risk</th>
          </tr>
        </thead>
        <tbody>
          {list.map((p) => (
            <tr key={p.id} className="border-b border-line">
              <td className="px-6 py-2.5">
                <PatientName patient={p} />
                {S.isOverdueNow(p) && <div className="mt-0.5 text-xs text-[#9A6A12]">{S.reasonFor(p)}</div>}
              </td>
              <td className={cn('num px-2 text-right', S.isOverdueNow(p) ? 'font-medium text-[#9A6A12]' : 'text-ink')}>{daysSince(p.stageEnteredOn)}</td>
              <td className="px-6 text-right"><RiskBadge score={p.risk.score} band={p.risk.band} showBand={false} size="sm" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </Sheet>
  );
}

function ValueDialog({ open, onOpenChange, total }: { open: boolean; onOpenChange: (o: boolean) => void; total: number }) {
  const patients = useDemo((s) => s.patients);
  const list = useMemo(() => S.valueAtRiskPatients(patients), [patients]);
  const overdueSum = list.filter(S.isOverdueNow).reduce((s, p) => s + p.estimatedValueINR, 0);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        wide
        title={<span className="num">{formatCrore(total)} of planned treatment waiting</span>}
        description={<span className="num">Next treatment step for {list.length} patients: overdue patients ({formatINR(overdueSum)}) and patients with frozen embryos, no FET plan and nothing booked ({formatINR(total - overdueSum)}). Each patient counted once.</span>}
      >
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-paper">
              <tr className="border-b border-line text-left text-xs text-slate">
                <th className="px-6 py-2 font-normal">Patient</th>
                <th className="px-2 py-2 font-normal">Stage</th>
                <th className="px-2 py-2 font-normal">Why</th>
                <th className="px-6 py-2 text-right font-normal">Next step value</th>
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-line">
                  <td className="px-6 py-2"><Link to={`/patients/${p.id}`} className="font-serif text-ink hover:text-lagoon">{p.name}</Link></td>
                  <td className="px-2"><StageChip stage={p.stage} /></td>
                  <td className="px-2 text-xs text-slate">{S.isOverdueNow(p) ? `Overdue (${p.overdueRuleId})` : 'Frozen embryos, no FET plan'}</td>
                  <td className="num px-6 text-right">{formatINR(p.estimatedValueINR)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t border-line px-6 py-3 text-xs text-slate">Estimated from the clinic’s package prices in Billing.</div>
      </DialogContent>
    </Dialog>
  );
}
