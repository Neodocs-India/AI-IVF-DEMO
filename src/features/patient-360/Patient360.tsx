import { useParams, useSearchParams, Link } from 'react-router-dom';
import { AlertTriangle, CalendarCheck, ShieldAlert } from 'lucide-react';
import type { Cycle, Patient, TimelineEvent } from '@/data/types';
import { PRICES, TREATMENT_LABEL, staffById, stageById } from '@/data/constants';
import { usePatient, useDemo } from '@/store/demo';
import * as S from '@/lib/selectors';
import { daysSince, daysUntil, fmtDate, fmtDateTime, fmtDay, fmtDuration, fmtMonth } from '@/lib/dates';
import { formatINR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PatientJourney } from '@/components/PatientJourney';
import { RiskBadge, SourceChip, StageChip, TrendIcon, PriorityTag } from '@/components/Badges';
import { RiskFactors } from '@/components/RiskFactors';
import { MessageThread } from '@/components/MessageThread';
import { Panel, Empty, Label } from '@/components/Panel';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/ui/button';

export default function Patient360() {
  const { id } = useParams();
  const p = usePatient(id);
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') ?? 'overview';
  if (!p) {
    return (
      <div className="rounded border border-line bg-paper p-8">
        <h1 className="text-lg font-semibold">No patient with ID {id}</h1>
        <Link to="/patients" className="mt-2 inline-block text-sm text-lagoon hover:underline">Go to the patient directory</Link>
      </div>
    );
  }
  const consultant = staffById(p.consultantId);
  const navigator = staffById(p.navigatorId);
  const openTasks = p.tasks.filter((t) => t.status !== 'Done').length;

  return (
    <div>
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-xs text-slate">
            <Link to="/patients" className="hover:text-lagoon">Patients</Link> / <span className="num">{p.id}</span>
          </p>
          <h1 className="mt-1 font-serif text-xl font-medium leading-tight text-ink">
            {p.name} <span className="text-slate">({p.age})</span>
            {p.partner && <> <span className="text-slate">and</span> {p.partner.name} <span className="text-slate">({p.partner.age})</span></>}
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            {p.locality} · {p.distanceKm} km · {p.language} · {p.phoneMasked} · Referred: {p.referrerName ?? p.referralSource}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
            <span className="inline-flex items-center gap-2"><Avatar name={consultant.name} tone={consultant.tone} size={22} /><span className="text-slate">Consultant</span> {consultant.name}</span>
            <span className="inline-flex items-center gap-2"><Avatar name={navigator.name} tone={navigator.tone} size={22} /><span className="text-slate">Navigator</span> {navigator.name}</span>
          </div>
        </div>
        <dl className="grid grid-cols-[auto_auto] gap-x-4 gap-y-2 text-sm">
          <dt className="text-slate">Dropout risk</dt>
          <dd className="flex items-center gap-2"><RiskBadge score={p.risk.score} band={p.risk.band} animate /><TrendIcon trend={p.risk.trend} /></dd>
          <dt className="text-slate">Treatment</dt>
          <dd>{TREATMENT_LABEL[p.treatmentType]}</dd>
          <dt className="text-slate">Current stage</dt>
          <dd><StageChip stage={p.stage} /> <span className="num text-xs text-slate">{daysSince(p.stageEnteredOn)} days</span></dd>
        </dl>
      </header>

      {S.isOverdueNow(p) ? (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded border border-saffron/50 bg-saffron-50 px-4 py-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-saffron" />
          <span className="font-medium text-ink">{S.reasonFor(p)}</span>
          <span className="num text-[#9A6A12]">{p.overdueDays} days overdue · rule {p.overdueRuleId}</span>
          {S.ruleById(p.overdueRuleId)?.sensitive && <span className="text-slate">· Sensitive: human contact only</span>}
          <Button size="sm" className="ml-auto" asChild><Link to={`/worklist?patient=${p.id}`}>Open in worklist</Link></Button>
        </div>
      ) : p.nextAppointment ? (
        <div className="mb-6 flex items-center gap-3 rounded border border-sage/40 bg-sage-50 px-4 py-3 text-sm">
          <CalendarCheck className="h-4 w-4 text-sage" />
          <span className="text-ink">{p.nextAppointment.type} {p.nextAppointment.on === '2026-10-12' ? 'today' : fmtDate(p.nextAppointment.on)} at {p.nextAppointment.time} with {staffById(p.nextAppointment.withId).name}</span>
        </div>
      ) : null}

      {/* Journey */}
      <section className="mb-6 rounded border border-line bg-paper px-5 pb-2 pt-4" data-tour="patient-journey">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Journey</h2>
          <span className="text-xs text-slate">Stages with dates · earlier cycles shown as loops</span>
        </div>
        <PatientJourney patient={p} />
      </section>

      <Tabs value={tab} onValueChange={(t) => setParams({ tab: t }, { replace: true })}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="cycles" data-tour="tab-cycles">Cycles <span className="num text-xs text-slate">{p.cycles.length}</span></TabsTrigger>
          <TabsTrigger value="storage">Embryos & storage <span className="num text-xs text-slate">{S.storedEmbryos(p) || ''}</span></TabsTrigger>
          <TabsTrigger value="messages">Messages <span className="num text-xs text-slate">{p.messages.length}</span></TabsTrigger>
          <TabsTrigger value="tasks">Tasks <span className="num text-xs text-slate">{openTasks}</span></TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="wellbeing">Wellbeing</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="overview"><Overview p={p} /></TabsContent>
          <TabsContent value="timeline"><Timeline events={p.timeline} /></TabsContent>
          <TabsContent value="cycles"><Cycles p={p} /></TabsContent>
          <TabsContent value="storage"><Storage p={p} /></TabsContent>
          <TabsContent value="messages">
            <div className="max-w-3xl rounded border border-line bg-paper px-6 py-5">
              {p.staffNote && (
                <div className="mb-4 flex gap-2 rounded border border-saffron/40 bg-saffron-50 px-3 py-2 text-sm text-ink">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-saffron" /> {p.staffNote}
                  <span className="ml-auto shrink-0 text-xs text-slate">Staff only</span>
                </div>
              )}
              <MessageThread messages={p.messages} language={p.language} />
            </div>
          </TabsContent>
          <TabsContent value="tasks"><Tasks p={p} /></TabsContent>
          <TabsContent value="financial"><Financial p={p} /></TabsContent>
          <TabsContent value="wellbeing"><Wellbeing p={p} /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

// ---------------------------------------------------------------------------

function Row({ label, children, source }: { label: string; children: React.ReactNode; source?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[150px_1fr] items-baseline gap-4 border-b border-line py-2.5 last:border-0">
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm text-ink">
        {children}
        {source}
      </dd>
    </div>
  );
}

function Overview({ p }: { p: Patient }) {
  const c = p.clinical;
  const labDate = c.labDate ? fmtDay(c.labDate) + ' ' + c.labDate.slice(0, 4) : undefined;
  const open = p.tasks.filter((t) => t.status !== 'Done');
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-6">
        <Panel title="Clinical snapshot">
          <dl>
            <Row label="Diagnosis" source={<SourceChip source="EMR" />}>{c.diagnosis.join('; ')}</Row>
            <Row label="Infertility" source={<SourceChip source="EMR" />}>{c.infertilityYears ? `${c.type}, ${c.infertilityYears} years` : 'Not applicable'}</Row>
            {c.amh !== undefined && <Row label="AMH" source={<SourceChip source="Lab" date={labDate} />}><span className="num">{c.amh} ng/mL</span>{c.amh < 1.2 && <span className="text-xs text-slate">low</span>}</Row>}
            {c.afc !== undefined && <Row label="AFC" source={<SourceChip source="EMR" />}><span className="num">{c.afc}</span></Row>}
            {c.bmi !== undefined && <Row label="BMI" source={<SourceChip source="EMR" />}><span className="num">{c.bmi}</span></Row>}
            {c.tsh !== undefined && <Row label="TSH" source={<SourceChip source="Lab" date={labDate} />}><span className="num">{c.tsh} mIU/L</span></Row>}
            {c.vitD !== undefined && <Row label="Vitamin D" source={<SourceChip source="Lab" date={labDate} />}><span className="num">{c.vitD} ng/mL</span><span className="text-xs font-medium text-[#9A6A12]">Low · no supplementation documented</span></Row>}
            {c.semen && (
              <Row label="Semen analysis" source={<SourceChip source="Lab" date={labDate} />}>
                <span className="num">{c.semen.concentration} M/mL · progressive motility {c.semen.progressiveMotility}% · normal morphology {c.semen.morphology}%</span>
              </Row>
            )}
          </dl>
        </Panel>
        <Panel title="Next expected event">
          <p className="text-base text-ink">{p.nextExpectedEvent.label}</p>
          <p className="num mt-0.5 text-sm text-slate">{fmtDate(p.nextExpectedEvent.dueOn)} · {daysUntil(p.nextExpectedEvent.dueOn) < 0 ? `${-daysUntil(p.nextExpectedEvent.dueOn)} days ago` : daysUntil(p.nextExpectedEvent.dueOn) === 0 ? 'today' : `in ${daysUntil(p.nextExpectedEvent.dueOn)} days`}</p>
        </Panel>
        <Panel title="Open tasks" meta={`${open.length} open`}>
          {open.length ? <TaskList tasks={open} /> : <Empty>No open tasks.</Empty>}
        </Panel>
      </div>
      <div className="space-y-6">
        <Panel title="Risk of dropping out" meta="Weights add up to the score" action={<RiskBadge score={p.risk.score} band={p.risk.band} animate />}>
          <RiskFactors risk={p.risk} />
          <div className="mt-5 border-t border-line pt-4">
            <Label className="mb-2">Suggested actions · AI suggestion, review before acting</Label>
            <ul className="space-y-2">
              {p.risk.suggestedActions.map((a) => (
                <li key={a} className="flex gap-2.5 text-sm text-ink"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lagoon" />{a}</li>
              ))}
            </ul>
          </div>
        </Panel>
        <Panel title="Recent activity">
          <Timeline events={[...p.timeline].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 5)} compact />
        </Panel>
      </div>
    </div>
  );
}

function TaskList({ tasks }: { tasks: Patient['tasks'] }) {
  return (
    <ul className="divide-y divide-line">
      {tasks.map((t) => (
        <li key={t.id} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
          <div>
            <div className="text-sm text-ink">{t.title}</div>
            <div className="text-xs text-slate">{t.assigneeId ? staffById(t.assigneeId).name : t.ownerRole} · due {t.dueOn === '2026-10-12' ? 'today' : fmtDate(t.dueOn)}{t.ruleId ? ` · ${t.ruleId}` : ''}{t.status === 'Snoozed' ? ' · snoozed' : ''}</div>
            {t.note && <div className="text-xs font-medium text-[#9A6A12]">{t.note}</div>}
          </div>
          <PriorityTag priority={t.priority} />
        </li>
      ))}
    </ul>
  );
}

const TYPE_DOT: Record<TimelineEvent['type'], string> = {
  Consult: 'bg-lagoon', Investigation: 'bg-[#6B4E9B]', Scan: 'bg-[#3D5A80]', Procedure: 'bg-ink', Lab: 'bg-[#6B4E9B]', Message: 'bg-sage', Call: 'bg-sage', Payment: 'bg-[#8A6A1F]', Note: 'bg-slate', Alert: 'bg-saffron',
};

function Timeline({ events, compact }: { events: TimelineEvent[]; compact?: boolean }) {
  const sorted = [...events].sort((a, b) => b.at.localeCompare(a.at));
  if (!sorted.length) return <Empty>No events yet.</Empty>;
  const groups = new Map<string, TimelineEvent[]>();
  for (const e of sorted) {
    const k = compact ? 'all' : e.at.slice(0, 7);
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  return (
    <div className={cn(!compact && 'max-w-3xl rounded border border-line bg-paper px-6 py-5')}>
      {[...groups.entries()].map(([k, list]) => (
        <div key={k} className={cn(!compact && 'mb-5 last:mb-0')}>
          {!compact && <h3 className="mb-2 text-xs text-slate">{fmtMonth(k + '-01')}</h3>}
          <ol className="relative space-y-3 border-l border-line pl-5">
            {list.map((e) => (
              <li key={e.at + e.title} className="relative">
                <span className={cn('absolute -left-[24px] top-1.5 h-2 w-2 rounded-full ring-2 ring-paper', TYPE_DOT[e.type])} />
                <div className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <span className="num w-[92px] shrink-0 text-xs text-slate">{fmtDateTime(e.at)}</span>
                  <span className="text-ink">{e.title}</span>
                  <SourceChip source={e.source} />
                </div>
                {e.detail && <p className="ml-[100px] mt-0.5 text-xs text-slate">{e.detail}</p>}
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

function Cycles({ p }: { p: Patient }) {
  if (!p.cycles.length) return <div className="rounded border border-line bg-paper"><Empty>No treatment cycles yet.</Empty></div>;
  return (
    <div className="space-y-6">
      {[...p.cycles].reverse().map((c) => <CycleCard key={c.id} c={c} />)}
    </div>
  );
}

const OUTCOME_TONE: Record<Cycle['outcome'], string> = {
  Ongoing: 'bg-lagoon-50 text-lagoon',
  Negative: 'bg-mist text-ink',
  Biochemical: 'bg-mist text-ink',
  'Clinical pregnancy': 'bg-sage/15 text-sage',
  Miscarriage: 'bg-mist text-ink',
  Cancelled: 'bg-mist text-slate',
};

function CycleCard({ c }: { c: Cycle }) {
  const cascade = [
    { label: 'Oocytes', v: c.oocytes },
    { label: 'MII', v: c.mii },
    { label: '2PN', v: c.fertilised2PN },
    { label: 'Blastocysts', v: c.blastocysts?.length },
  ].filter((x) => x.v !== undefined) as { label: string; v: number }[];
  const max = Math.max(1, ...cascade.map((x) => x.v));
  const outcomeLabel = c.outcome === 'Cancelled' ? (c.type === 'FERTILITY_PRESERVATION' ? 'Oocytes vitrified' : 'Freeze-all') : c.outcome;
  return (
    <article className="rounded border border-line bg-paper">
      <header className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line px-5 py-3">
        <div className="flex items-baseline gap-3">
          <h3 className="text-base font-semibold">{c.type === 'FET' ? 'Frozen embryo transfer' : c.type === 'FERTILITY_PRESERVATION' ? 'Oocyte freezing' : 'ICSI cycle'} {c.number}</h3>
          <span className="text-sm text-slate">{fmtMonth(c.startOn)} · {c.protocol}</span>
          <SourceChip source="IVF software" />
        </div>
        <span className={cn('rounded px-2 py-0.5 text-xs font-medium', OUTCOME_TONE[c.outcome])}>{outcomeLabel}</span>
      </header>
      <div className="grid gap-6 px-5 py-4 md:grid-cols-[220px_1fr_220px]">
        <dl className="space-y-1.5 text-sm">
          {c.stimDays !== undefined && <div className="flex justify-between gap-3"><dt className="text-slate">Stimulation</dt><dd className="num">{c.stimDays} days</dd></div>}
          {c.gonadotropins && <div><dt className="text-slate">Gonadotropins</dt><dd>{c.gonadotropins}</dd></div>}
          {c.triggerOn && <div className="flex justify-between gap-3"><dt className="text-slate">Trigger</dt><dd className="num">{fmtDay(c.triggerOn)}</dd></div>}
          {c.opuOn && <div className="flex justify-between gap-3"><dt className="text-slate">OPU</dt><dd className="num">{fmtDay(c.opuOn)}</dd></div>}
          {!c.opuOn && c.type === 'FET' && <div className="flex justify-between gap-3"><dt className="text-slate">Preparation</dt><dd>{c.protocol}</dd></div>}
        </dl>
        <div>
          {cascade.length > 0 ? (
            <div className="space-y-2">
              {cascade.map((x) => (
                <div key={x.label} className="grid grid-cols-[84px_1fr_28px] items-center gap-3 text-sm">
                  <span className="text-slate">{x.label}</span>
                  <span className="h-3 rounded-sm bg-mist"><span className="block h-3 rounded-sm bg-lagoon/70" style={{ width: `${(x.v / max) * 100}%` }} /></span>
                  <span className="num text-right font-semibold">{x.v}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate">{c.note}</p>
          )}
          {c.blastocysts && c.blastocysts.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {c.blastocysts.map((b, i) => (
                <span key={i} className={cn('rounded border px-2 py-1 text-xs', b.fate === 'Transferred' ? 'border-lagoon bg-lagoon-50 text-ink' : b.fate === 'Vitrified' ? 'border-[#2F6F8F]/40 bg-paper text-ink' : 'border-line text-slate line-through')}>
                  Day {b.day} <span className="font-semibold">{b.grade}</span> · {b.fate.toLowerCase()}
                </span>
              ))}
            </div>
          )}
          {cascade.length > 0 && c.note && <p className="mt-3 text-xs text-slate">{c.note}</p>}
        </div>
        <dl className="space-y-1.5 text-sm">
          {c.transferOn && <div className="flex justify-between gap-3"><dt className="text-slate">Transfer</dt><dd className="num">{fmtDay(c.transferOn)}</dd></div>}
          {c.endometriumMm && <div className="flex justify-between gap-3"><dt className="text-slate">Endometrium</dt><dd className="num">{c.endometriumMm} mm</dd></div>}
          {c.betaOn && <div className="flex justify-between gap-3"><dt className="text-slate">Beta hCG</dt><dd className="num">{c.betaValue === undefined ? 'Awaited' : `${c.betaValue} mIU/mL`}</dd></div>}
          {c.betaOn && <div className="flex justify-between gap-3"><dt className="text-slate">Beta date</dt><dd className="num">{fmtDay(c.betaOn)}</dd></div>}
          <div className="flex items-center justify-between gap-3 pt-1"><dt className="text-slate">Source</dt><dd>{c.betaOn ? <SourceChip source="Lab" /> : <SourceChip source="IVF software" />}</dd></div>
        </dl>
      </div>
    </article>
  );
}

function Storage({ p }: { p: Patient }) {
  if (!p.cryo.length) return <div className="rounded border border-line bg-paper"><Empty>No stored embryos, oocytes or sperm.</Empty></div>;
  const embryos = S.storedEmbryos(p);
  return (
    <div className="space-y-4">
      {embryos > 0 && (
        <p className="text-base text-ink">
          <span className="num font-semibold">{embryos}</span> vitrified embryo{embryos === 1 ? '' : 's'} in storage.{' '}
          <span className="text-slate">{p.cryo.some((c) => c.disposition === 'Pending decision') ? 'No FET plan yet.' : ''}</span>
        </p>
      )}
      <div className="overflow-x-auto rounded border border-line bg-paper">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-slate">
              {['Material', 'Grade / day', 'Frozen on', 'Location', 'Stored for', 'Renewal due', 'Consent valid until', 'Fee', 'Disposition'].map((h) => <th key={h} className="px-4 py-2 font-normal">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {p.cryo.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3"><span className="num font-semibold">{c.count}</span> {c.kind === 'Embryo' ? (c.count === 1 ? 'blastocyst' : 'blastocysts') : c.kind === 'Oocytes' ? 'MII oocytes' : c.count === 1 ? 'sperm sample' : 'sperm samples'}</td>
                <td className="px-4">{c.grade ?? '—'}{c.dayFrozen ? ` · day ${c.dayFrozen}` : ''}</td>
                <td className="num px-4">{fmtDate(c.frozenOn)}</td>
                <td className="px-4">{c.tank}, Canister {c.canister}, Cane {c.cane}</td>
                <td className="num px-4">{fmtDuration(daysSince(c.frozenOn))}</td>
                <td className={cn('num px-4', daysUntil(c.storageRenewalDue) <= 60 && 'font-medium text-[#9A6A12]')}>{fmtDate(c.storageRenewalDue)}</td>
                <td className="num px-4">{fmtDate(c.consentValidUntil)}</td>
                <td className={cn('px-4', c.feeStatus === 'Overdue' ? 'text-rose' : c.feeStatus === 'Due' ? 'text-[#9A6A12]' : 'text-sage')}>{c.feeStatus}</td>
                <td className="px-4">{c.disposition}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-line px-4 py-2 text-xs text-slate">Source: <SourceChip source="Cryo register" /> Storage limits and consent follow the ART (Regulation) Act, 2021 and clinic policy.</div>
      </div>
      {p.cryo.some((c) => c.attemptsLog) && <UnreachableLog p={p} />}
    </div>
  );
}

export function UnreachableLog({ p }: { p: Patient }) {
  const item = p.cryo.find((c) => c.attemptsLog)!;
  return (
    <Panel title="Unreachable-patient protocol" meta={`${item.contactAttempts} failed contact attempts`}>
      <ol className="space-y-2">
        {item.attemptsLog!.map((a, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-line text-xs text-slate">{i + 1}</span>
            <span className="num w-24 text-slate">{fmtDate(a.on)}</span>
            <span className="w-36 text-ink">{a.channel}</span>
            <span className="text-slate">{a.outcome}</span>
          </li>
        ))}
        <li className="flex items-center gap-3 text-sm">
          <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-lagoon text-xs text-lagoon">4</span>
          <span className="w-24 text-slate">Next step</span>
          <span className="font-medium text-ink">Contact alternate number / referrer</span>
        </li>
      </ol>
      <p className="mt-4 rounded bg-mist px-3 py-2 text-sm text-ink">
        No disposition action without documented consent. Storage limits and consent follow ART (Regulation) Act, 2021 and clinic policy.
      </p>
    </Panel>
  );
}

function Tasks({ p }: { p: Patient }) {
  const open = p.tasks.filter((t) => t.status !== 'Done');
  const done = p.tasks.filter((t) => t.status === 'Done');
  return (
    <div className="grid max-w-5xl gap-6 md:grid-cols-2">
      <Panel title="Open" meta={`${open.length}`}>{open.length ? <TaskList tasks={open} /> : <Empty>No open tasks.</Empty>}</Panel>
      <Panel title="Done" meta={`${done.length}`}>{done.length ? <TaskList tasks={done} /> : <Empty>Nothing completed yet.</Empty>}</Panel>
    </div>
  );
}

function Financial({ p }: { p: Patient }) {
  const f = p.financial;
  return (
    <div className="grid max-w-5xl gap-6 md:grid-cols-2">
      <Panel title="Current package" action={<SourceChip source="Billing" />}>
        <dl>
          <Row label="Package">{f.package}</Row>
          <Row label="Paid"><span className="num">{formatINR(f.paidINR)}</span></Row>
          <Row label="Due"><span className={cn('num', f.dueINR > 0 && 'font-medium text-[#9A6A12]')}>{formatINR(f.dueINR)}</span></Row>
          <Row label="EMI">{f.emi ? 'Yes, via partner bank' : 'No'}</Row>
          {f.note && <Row label="Note">{f.note}</Row>}
        </dl>
      </Panel>
      <Panel title="Cost estimates on file" meta="Clinic package prices" action={<SourceChip source="Billing" />}>
        <dl>
          <Row label="FET package"><span className="num">{formatINR(PRICES.fetMin)}–{formatINR(PRICES.fetMax)}</span></Row>
          <Row label="New ICSI cycle"><span className="num">₹1.8–2.2 lakh</span></Row>
          <Row label="Embryo storage"><span className="num">₹18,000 per year</span></Row>
        </dl>
        {S.storedEmbryos(p) > 0 && <p className="mt-3 text-sm text-slate">This patient has {S.storedEmbryos(p)} stored embryo{S.storedEmbryos(p) === 1 ? '' : 's'}; an FET does not need a new stimulation.</p>}
      </Panel>
    </div>
  );
}

function Wellbeing({ p }: { p: Patient }) {
  const toast = useDemo((s) => s.toast);
  const w = p.wellbeing;
  if (!w?.lastScreenOn) {
    return (
      <Panel title="Wellbeing screen" className="max-w-2xl">
        <p className="text-sm text-ink">Not yet completed.</p>
        {p.stage === 'review_after_negative' && <p className="mt-1 text-sm text-slate">Recommended after a negative result. Counsellor: Ritu Malhotra.</p>}
        <Button className="mt-4" variant="secondary" onClick={() => toast(`Wellbeing screen sent to ${p.name.split(' ')[0]} on WhatsApp.`, 'positive')}>Send wellbeing screen</Button>
      </Panel>
    );
  }
  const pctOf = Math.min(100, ((w.score ?? 0) / 30) * 100);
  return (
    <Panel title="Wellbeing screen" meta={`Last completed ${fmtDate(w.lastScreenOn)}`} className="max-w-2xl">
      <div className="flex items-baseline gap-3">
        <span className="num text-xl font-semibold">{w.score}</span>
        <span className="text-sm text-slate">of 30 · {w.band}</span>
      </div>
      <div className="relative mt-3 flex h-2 gap-0.5">
        <span className="h-2 w-1/3 rounded-l-full bg-sage/40" /><span className="h-2 w-1/3 bg-saffron/50" /><span className="h-2 w-1/3 rounded-r-full bg-rose/40" />
        <span className="absolute -top-1 h-4 w-1 rounded bg-ink" style={{ left: `${pctOf}%` }} />
      </div>
      <div className="mt-1 flex justify-between text-xs text-slate"><span>Low</span><span>Moderate</span><span>High distress</span></div>
      <p className="mt-4 text-sm text-slate">Screen results are shared with the counsellor, Ritu Malhotra. {stageById(p.stage).label} stage.</p>
    </Panel>
  );
}
