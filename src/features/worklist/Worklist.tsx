import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, MessageCircle, Phone, Smartphone } from 'lucide-react';
import type { Patient, Task } from '@/data/types';
import { staffById } from '@/data/constants';
import { useDemo } from '@/store/demo';
import * as S from '@/lib/selectors';
import { greeting } from '@/lib/format';
import { fmtDate, fmtDay, relativeDays } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { PriorityTag, RiskBadge, StageChip } from '@/components/Badges';
import { Avatar } from '@/components/Avatar';
import { Empty } from '@/components/Panel';
import { Button } from '@/components/ui/button';
import { PatientDrawer } from './PatientDrawer';

type TabId = 'overdue' | 'today' | 'critical' | 'snoozed' | 'done';
const NAVS = [
  { id: 'all', label: 'Everyone' },
  { id: 'sneha-pawar', label: 'Sneha' },
  { id: 'imran-sayyed', label: 'Imran' },
] as const;

const CHANNEL_ICON = { WhatsApp: MessageCircle, Call: Phone, SMS: Smartphone };

export default function Worklist() {
  const patients = useDemo((s) => s.patients);
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as TabId) || 'overdue';
  const [nav, setNav] = useState<(typeof NAVS)[number]['id']>('all');
  const [open, setOpen] = useState<string | null>(params.get('patient'));
  const paramPatient = params.get('patient');
  useEffect(() => {
    if (paramPatient) setOpen(paramPatient);
  }, [paramPatient]);

  const data = useMemo(() => {
    const overdue = S.overduePatients(patients);
    return {
      overdue,
      today: S.dueTodayTasks(patients),
      critical: S.criticalTasks(patients),
      snoozed: S.snoozedPatients(patients),
      done: S.doneTodayTasks(patients),
    };
  }, [patients]);
  const byId = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const overdueShown = nav === 'all' ? data.overdue : data.overdue.filter((p) => p.navigatorId === nav);

  const setTab = (t: string) => setParams((prev) => { const n = new URLSearchParams(prev); n.set('tab', t); return n; }, { replace: true });

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          {greeting()}, Sneha. <span className="num"><AnimatedNumber value={data.overdue.length} /></span> patients need follow-up.
        </h1>
        <p className="mt-1 text-sm text-slate">Sorted by risk of dropping out. Select a patient to see why they are here and what to do next.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <TabsList data-tour="worklist-tabs">
            <TabsTrigger value="overdue">Overdue <Count n={data.overdue.length} tone="saffron" /></TabsTrigger>
            <TabsTrigger value="today">Due today <Count n={data.today.length} /></TabsTrigger>
            <TabsTrigger value="critical">Critical <Count n={data.critical.length} tone={data.critical.length ? 'rose' : undefined} /></TabsTrigger>
            <TabsTrigger value="snoozed">Snoozed <Count n={data.snoozed.length} /></TabsTrigger>
            <TabsTrigger value="done">Done today <Count n={data.done.length} /></TabsTrigger>
          </TabsList>
          {tab === 'overdue' && (
            <div className="mb-2 flex items-center gap-1 text-xs">
              <span className="mr-1 text-slate">Assigned to</span>
              {NAVS.map((n) => (
                <button key={n.id} type="button" onClick={() => setNav(n.id)} className={cn('rounded px-2 py-1', nav === n.id ? 'bg-ink text-white' : 'text-slate hover:bg-paper')}>
                  {n.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="overdue" className="mt-4">
          <OverdueTable rows={overdueShown} onOpen={setOpen} />
        </TabsContent>
        <TabsContent value="today" className="mt-4">
          <TaskTable tasks={data.today} byId={byId} onOpen={setOpen} empty="No tasks due today." />
        </TabsContent>
        <TabsContent value="critical" className="mt-4">
          <TaskTable tasks={data.critical} byId={byId} onOpen={setOpen} empty="No critical alerts. Clinical alerts from patient messages appear here." critical />
        </TabsContent>
        <TabsContent value="snoozed" className="mt-4">
          <SnoozedTable rows={data.snoozed} onOpen={setOpen} />
        </TabsContent>
        <TabsContent value="done" className="mt-4">
          <TaskTable tasks={data.done} byId={byId} onOpen={setOpen} empty="Nothing completed yet today." done />
        </TabsContent>
      </Tabs>

      <PatientDrawer patientId={open} onClose={() => { setOpen(null); if (paramPatient) setParams((prev) => { const n = new URLSearchParams(prev); n.delete('patient'); return n; }, { replace: true }); }} />
    </div>
  );
}

function Count({ n, tone }: { n: number; tone?: 'saffron' | 'rose' }) {
  return (
    <span className={cn('num rounded-full px-1.5 py-px text-xs font-medium', tone === 'saffron' ? 'bg-saffron/15 text-[#9A6A12]' : tone === 'rose' ? 'bg-rose text-white' : 'bg-mist text-slate')}>
      <AnimatedNumber value={n} />
    </span>
  );
}

const TH = 'px-3 py-2 text-left text-xs font-normal text-slate';

function OverdueTable({ rows, onOpen }: { rows: Patient[]; onOpen: (id: string) => void }) {
  if (!rows.length) return <Empty>No overdue patients.</Empty>;
  return (
    <div className="overflow-x-auto rounded border border-line bg-paper">
      <table className="w-full min-w-[1080px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className={cn(TH, 'pl-5')}>Patient</th>
            <th className={TH}>Stage</th>
            <th className={TH}>Why</th>
            <th className={cn(TH, 'text-right')}>Overdue</th>
            <th className={TH}>Risk</th>
            <th className={TH}>Language</th>
            <th className={TH}>Channel</th>
            <th className={TH}>Last contact</th>
            <th className={cn(TH, 'pr-5')}>Navigator</th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((p) => {
              const Icon = CHANNEL_ICON[p.preferredChannel];
              const nav = staffById(p.navigatorId);
              return (
                <motion.tr
                  key={p.id}
                  layout
                  exit={{ opacity: 0, x: 40, transition: { duration: 0.35 } }}
                  onClick={() => onOpen(p.id)}
                  data-tour={p.id === 'P-24817' ? 'priya-row' : undefined}
                  className="cursor-pointer border-b border-line last:border-0 hover:bg-mist/70"
                >
                  <td className="py-3 pl-5 pr-3">
                    <div className="font-serif text-base font-medium text-ink">{p.name}</div>
                    <div className="text-xs text-slate">{p.partner ? `with ${p.partner.name.split(' ')[0]} · ` : ''}{p.age} y · {p.id}</div>
                  </td>
                  <td className="px-3"><StageChip stage={p.stage} /></td>
                  <td className="max-w-[300px] px-3 text-ink">{S.reasonFor(p)}</td>
                  <td className="num px-3 text-right font-medium text-[#9A6A12]">{p.overdueDays} d</td>
                  <td className="px-3"><RiskBadge score={p.risk.score} band={p.risk.band} /></td>
                  <td className="px-3 text-slate">{p.language}</td>
                  <td className="px-3 text-slate"><span className="inline-flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" />{p.preferredChannel}</span></td>
                  <td className="num px-3 text-slate">{p.lastContactOn ? relativeDays(p.lastContactOn) : '—'}</td>
                  <td className="pr-5">
                    <span className="inline-flex items-center gap-2 text-slate"><Avatar name={nav.name} tone={nav.tone} size={22} />{nav.shortName}</span>
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function TaskTable({ tasks, byId, onOpen, empty, critical, done }: { tasks: Task[]; byId: Map<string, Patient>; onOpen: (id: string) => void; empty: string; critical?: boolean; done?: boolean }) {
  const complete = useDemo((s) => s.completeTask);
  if (!tasks.length) return <div className="rounded border border-line bg-paper"><Empty>{empty}</Empty></div>;
  return (
    <div className={cn('overflow-x-auto rounded border bg-paper', critical ? 'border-rose/50' : 'border-line')}>
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-line">
            <th className={cn(TH, 'pl-5')}>{done ? 'Done' : 'Due'}</th>
            <th className={TH}>Task</th>
            <th className={TH}>Patient</th>
            <th className={TH}>Owner</th>
            <th className={TH}>Priority</th>
            <th className={cn(TH, 'pr-5 text-right')}><span className="sr-only">Action</span></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {tasks.map((t) => {
              const p = byId.get(t.patientId)!;
              const owner = t.assigneeId ? staffById(t.assigneeId) : null;
              return (
                <motion.tr key={t.id} layout initial={{ opacity: 0, backgroundColor: 'rgba(217,151,30,0.15)' }} animate={{ opacity: 1, backgroundColor: 'rgba(255,255,255,0)' }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="border-b border-line last:border-0">
                  <td className="num py-3 pl-5 pr-3 text-slate">{done ? t.doneAt?.slice(11, 16) : t.dueTime ?? (t.dueOn === '2026-10-12' ? 'Today' : fmtDay(t.dueOn))}</td>
                  <td className="px-3">
                    <div className={cn('text-ink', critical && 'font-medium text-rose')}>{t.title}</div>
                    {t.note && <div className="mt-0.5 text-xs font-medium text-[#9A6A12]">{t.note}</div>}
                    {t.ruleId && <div className="text-xs text-slate">Rule {t.ruleId}{S.ruleById(t.ruleId)?.sensitive ? ' · sensitive' : ''}</div>}
                  </td>
                  <td className="px-3">
                    <button type="button" onClick={() => onOpen(p.id)} className="text-left font-serif text-[15px] text-ink hover:text-lagoon">{p.name}</button>
                    <div><StageChip stage={p.stage} className="mt-0.5" /></div>
                  </td>
                  <td className="px-3 text-slate">{owner ? <span className="inline-flex items-center gap-2"><Avatar name={owner.name} tone={owner.tone} size={22} />{owner.name}</span> : t.ownerRole}</td>
                  <td className="px-3"><PriorityTag priority={t.priority} /></td>
                  <td className="pr-5 text-right">
                    {critical ? (
                      <Button size="sm" variant="critical" asChild><Link to={`/patients/${p.id}?tab=messages`}>Open record</Link></Button>
                    ) : !done ? (
                      <Button size="sm" variant="ghost" onClick={() => complete(t.id)}><Check /> Mark done</Button>
                    ) : (
                      <span className="text-xs text-sage">Done</span>
                    )}
                  </td>
                </motion.tr>
              );
            })}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}

function SnoozedTable({ rows, onOpen }: { rows: Patient[]; onOpen: (id: string) => void }) {
  const unsnooze = useDemo((s) => s.unsnooze);
  if (!rows.length) return <div className="rounded border border-line bg-paper"><Empty>No snoozed patients. Snoozing hides a patient from the overdue list until the date you choose.</Empty></div>;
  return (
    <div className="rounded border border-line bg-paper">
      <table className="w-full text-sm">
        <tbody>
          {rows.map((p) => (
            <tr key={p.id} className="border-b border-line last:border-0">
              <td className="py-3 pl-5"><button type="button" onClick={() => onOpen(p.id)} className="font-serif text-base text-ink hover:text-lagoon">{p.name}</button></td>
              <td className="px-3 text-ink">{S.reasonFor(p)}</td>
              <td className="px-3 text-slate">Until {fmtDate(p.snoozedUntil!)}</td>
              <td className="pr-5 text-right"><Button size="sm" variant="ghost" onClick={() => unsnooze(p.id)}>Unsnooze</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
