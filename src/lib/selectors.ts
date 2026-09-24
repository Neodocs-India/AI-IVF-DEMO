// Every number on screen is computed here from the data — CLAUDE.md §7.
import type { Appointment, CryoItem, Patient, StageId, Task } from '@/data/types';
import { ACTIVE_STAGES, DEMO_TODAY, RULES, stageById } from '@/data/constants';
import { daysSince, daysUntil, fmtDate } from './dates';

export const isActive = (p: Patient) => stageById(p.stage).active;
export const isSnoozed = (p: Patient) => !!p.snoozedUntil && p.snoozedUntil > DEMO_TODAY;
export const isOverdueNow = (p: Patient) => isActive(p) && p.isOverdue && !isSnoozed(p);

export const activePatients = (ps: Patient[]) => ps.filter(isActive);
export const overduePatients = (ps: Patient[]) => ps.filter(isOverdueNow).sort((a, b) => b.risk.score - a.risk.score);
export const highRiskPatients = (ps: Patient[]) => ps.filter((p) => isActive(p) && p.risk.score >= 70).sort((a, b) => b.risk.score - a.risk.score);

export const storedEmbryos = (p: Patient) => p.cryo.filter((c) => c.kind === 'Embryo').reduce((s, c) => s + c.count, 0);
const NO_PLAN: CryoItem['disposition'][] = ['Pending decision', 'Unreachable protocol'];

/** Frozen embryos with no FET plan and nothing booked. */
export const isStalledFet = (p: Patient) =>
  !p.nextAppointment && p.cryo.some((c) => c.kind === 'Embryo' && c.count > 0 && NO_PLAN.includes(c.disposition));

export function valueAtRiskPatients(ps: Patient[]) {
  return ps.filter((p) => isOverdueNow(p) || isStalledFet(p)).sort((a, b) => b.estimatedValueINR - a.estimatedValueINR);
}
export const valueAtRisk = (ps: Patient[]) => valueAtRiskPatients(ps).reduce((s, p) => s + p.estimatedValueINR, 0);

export const allTasks = (ps: Patient[]) => ps.flatMap((p) => p.tasks);
export const dueTodayTasks = (ps: Patient[]) =>
  allTasks(ps).filter((t) => t.status === 'Open' && t.dueOn === DEMO_TODAY).sort((a, b) => priorityRank(a) - priorityRank(b) || (a.dueTime ?? '99').localeCompare(b.dueTime ?? '99'));
export const criticalTasks = (ps: Patient[]) => allTasks(ps).filter((t) => t.status === 'Open' && t.priority === 'Critical');
export const doneTodayTasks = (ps: Patient[]) => allTasks(ps).filter((t) => t.status === 'Done' && t.doneAt?.startsWith(DEMO_TODAY));
export const snoozedPatients = (ps: Patient[]) => ps.filter(isSnoozed);
const priorityRank = (t: Task) => (t.priority === 'Critical' ? 0 : t.priority === 'High' ? 1 : 2);

export const consultsToday = (as: Appointment[]) => [...as].sort((a, b) => a.time.localeCompare(b.time));

export function stageCounts(ps: Patient[]) {
  const counts = Object.fromEntries(ACTIVE_STAGES.map((s) => [s.id, { total: 0, overdue: 0 }])) as Record<StageId, { total: number; overdue: number }>;
  for (const p of ps) {
    if (!isActive(p)) continue;
    counts[p.stage].total++;
    if (isOverdueNow(p)) counts[p.stage].overdue++;
  }
  return counts;
}

export const patientsInStage = (ps: Patient[], stage: StageId) =>
  ps.filter((p) => p.stage === stage).sort((a, b) => Number(isOverdueNow(b)) - Number(isOverdueNow(a)) || daysSince(b.stageEnteredOn) - daysSince(a.stageEnteredOn));

// ---------------------------------------------------------------------------
// Cryo

export const cryoPatients = (ps: Patient[]) => ps.filter((p) => p.cryo.some((c) => c.count > 0));
const sumKind = (ps: Patient[], kind: CryoItem['kind']) => ps.reduce((s, p) => s + p.cryo.filter((c) => c.kind === kind).reduce((a, c) => a + c.count, 0), 0);

export const latestEmbryoFreeze = (p: Patient) =>
  p.cryo.filter((c) => c.kind === 'Embryo').map((c) => c.frozenOn).sort().pop();

export const isNoFetPlan6m = (p: Patient) => {
  const latest = latestEmbryoFreeze(p);
  return !!latest && daysSince(latest) > 180 && p.cryo.some((c) => c.kind === 'Embryo' && NO_PLAN.includes(c.disposition));
};
export const isRenewalDue60 = (p: Patient) => p.cryo.some((c) => daysUntil(c.storageRenewalDue) >= 0 && daysUntil(c.storageRenewalDue) <= 60);
export const isUnreachable = (p: Patient) => p.cryo.some((c) => c.contactAttempts >= 3);
export const isFeeOverdue = (p: Patient) => p.cryo.some((c) => c.feeStatus === 'Overdue');
export const isFertilityPreservation = (p: Patient) => p.cryo.some((c) => c.kind === 'Oocytes');

export function cryoMetrics(ps: Patient[]) {
  const cp = cryoPatients(ps);
  return {
    patients: cp.length,
    embryos: sumKind(ps, 'Embryo'),
    oocytes: sumKind(ps, 'Oocytes'),
    oocytePatients: cp.filter((p) => p.cryo.some((c) => c.kind === 'Oocytes')).length,
    sperm: sumKind(ps, 'Sperm'),
    noFetPlan: cp.filter(isNoFetPlan6m).length,
    renewals60: cp.filter(isRenewalDue60).length,
    unreachable: cp.filter(isUnreachable).length,
    feeOverdue: cp.filter(isFeeOverdue).length,
    fertilityPreservation: cp.filter(isFertilityPreservation).length,
  };
}

// ---------------------------------------------------------------------------
// Plain-language reason a patient is on the worklist

export function reasonFor(p: Patient): string {
  const d = daysSince(p.stageEnteredOn);
  switch (p.overdueRuleId) {
    case 'R-01': return `Enquired ${d} days ago, no first consult booked`;
    case 'R-02': return `First consult ${d} days ago, no work-up booked`;
    case 'R-03': return `Work-up complete ${d} days ago, no plan discussion`;
    case 'R-04': return `Plan given ${d} days ago, treatment not started`;
    case 'R-07': return `Negative result ${d} days ago, no review booked`;
    case 'R-09': return `${p.gestationWeeks ?? 12} weeks pregnant, obstetric handover not done`;
    case 'R-10': return `Freeze-all ${d} days ago, no FET plan`;
    case 'R-11': return `Embryos stored ${Math.round(d / 30.4)} months, no FET plan`;
    case 'R-13': {
      const renewal = p.cryo.find((c) => c.contactAttempts >= 3)?.storageRenewalDue;
      return `3 contact attempts unanswered${renewal ? `; storage renewal due ${fmtDate(renewal)}` : ''}`;
    }
    case 'R-14': return `Pause ended ${p.overdueDays} days ago, no contact since`;
    default: return p.nextExpectedEvent.label;
  }
}

export const ruleById = (id?: string) => RULES.find((r) => r.id === id);

// ---------------------------------------------------------------------------
// Team load

export function teamLoad(ps: Patient[]) {
  const open = allTasks(ps).filter((t) => t.status === 'Open');
  const by = new Map<string, { open: number; overdue: number; dueToday: number }>();
  for (const t of open) {
    if (!t.assigneeId) continue;
    const row = by.get(t.assigneeId) ?? { open: 0, overdue: 0, dueToday: 0 };
    row.open++;
    if (t.dueOn < DEMO_TODAY) row.overdue++;
    if (t.dueOn === DEMO_TODAY) row.dueToday++;
    by.set(t.assigneeId, row);
  }
  return by;
}

export const decisionTasks = (ps: Patient[], doctorId = 'anil-mehta') =>
  allTasks(ps).filter((t) => t.status === 'Open' && t.ownerRole === 'Doctor' && t.assigneeId === doctorId);
