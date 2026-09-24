// Zustand demo store — CLAUDE.md §10. All scripted state changes live here.
// Initial state is a deep copy of the seed; reset() restores it exactly.

import { create } from 'zustand';
import type { Appointment, FollowUpRule, Patient, ScheduleItem, Task } from '@/data/types';
import { freshDataset } from '@/data/seed';
import { DEMO_TODAY, RULES, staffById } from '@/data/constants';
import { HERO_IDS } from '@/data/heroes';
import {
  ANJALI_ESCALATION_NOTE, PRIYA_BRIEF, PRIYA_MSG_CONFIRM, PRIYA_MSG_REPLY, POOJA_OHSS_MSG,
} from '@/data/scripts';
import { addDays } from '@/lib/dates';
import { bandFor } from '@/lib/risk';

export interface Toast {
  id: number;
  text: string;
  tone: 'info' | 'positive' | 'critical';
}
export interface Notification {
  id: string;
  at: string;
  title: string;
  detail?: string;
  tone: 'info' | 'positive' | 'critical' | 'attention';
  href?: string;
  read: boolean;
}

export interface CallInput {
  outcome: 'Reached patient' | 'No answer' | 'Call back requested' | 'Wrong number';
  notes: string;
  steps: string[];
}

interface Flags {
  priyaCalled: boolean;
  betaArrived: boolean;
  ohss: boolean;
  ohssDismissed: boolean;
  anjaliEscalated: boolean;
  pipelineAnimated: boolean;
  priyaReplyShown: boolean;
}

interface DemoState {
  patients: Patient[];
  appointments: Appointment[];
  schedule: ScheduleItem[];
  rules: FollowUpRule[];
  flags: Flags;
  notifications: Notification[];
  toasts: Toast[];
  summariesSeen: string[];
  summariesReviewed: string[];
  tour: { open: boolean; step: number };
  shortcutsOpen: boolean;
  /** Bumped on reset so screens can re-key local state. */
  epoch: number;

  toast: (text: string, tone?: Toast['tone']) => void;
  dismissToast: (id: number) => void;
  markNotificationsRead: () => void;

  logCall: (patientId: string, input: CallInput) => void;
  sendWhatsApp: (patientId: string, text: string) => void;
  bookAppointment: (patientId: string) => void;
  referToCounsellor: (patientId: string) => void;
  escalateToDoctor: (patientId: string) => void;
  snooze: (patientId: string, days: number) => void;
  unsnooze: (patientId: string) => void;
  completeTask: (taskId: string) => void;

  triggerBeta: () => void;
  triggerOhss: () => void;
  dismissOhss: () => void;
  triggerAnjali: () => void;
  reset: () => void;

  updateRule: (id: string, patch: Partial<FollowUpRule>) => void;
  markSummarySeen: (appointmentId: string) => void;
  markSummaryReviewed: (appointmentId: string) => void;
  setPipelineAnimated: () => void;
  setPriyaReplyShown: () => void;
  setTour: (tour: Partial<DemoState['tour']>) => void;
  setShortcutsOpen: (open: boolean) => void;
}

const initialFlags = (): Flags => ({
  priyaCalled: false, betaArrived: false, ohss: false, ohssDismissed: false, anjaliEscalated: false, pipelineAnimated: false, priyaReplyShown: false,
});

let toastSeq = 0;
let nowMinute = 20; // demo "clock" for actions taken during the recording: 09:20, 09:21, …
const stamp = () => {
  nowMinute = Math.min(nowMinute + 1, 59);
  return `${DEMO_TODAY}T09:${String(nowMinute).padStart(2, '0')}`;
};

function initial() {
  const data = freshDataset();
  return {
    ...data,
    rules: structuredClone(RULES),
    flags: initialFlags(),
    notifications: [] as Notification[],
    toasts: [] as Toast[],
    summariesSeen: [] as string[],
    summariesReviewed: [] as string[],
    shortcutsOpen: false,
  };
}

/** Immutable patient update helper. */
function withPatient(state: DemoState, id: string, fn: (p: Patient) => void): Pick<DemoState, 'patients'> {
  return {
    patients: state.patients.map((p) => {
      if (p.id !== id) return p;
      const next = structuredClone(p);
      fn(next);
      return next;
    }),
  };
}

const closeFollowUps = (p: Patient, at: string) => {
  for (const t of p.tasks) {
    if (t.status !== 'Done' && t.kind === 'follow_up' && t.dueOn <= DEMO_TODAY) {
      t.status = 'Done';
      t.doneAt = at;
    }
  }
};

let taskSeq = 0;
const newTask = (p: Patient, t: Omit<Task, 'id' | 'patientId' | 'status'>): Task => ({ id: `T-L${++taskSeq}`, patientId: p.id, status: 'Open', ...t });

export const useDemo = create<DemoState>((set, get) => ({
  ...initial(),
  tour: { open: false, step: 0 },
  epoch: 0,

  toast: (text, tone = 'info') => {
    const id = ++toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, text, tone }] }));
    setTimeout(() => get().dismissToast(id), 4200);
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
  markNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),

  // -------------------------------------------------------------------------
  // §10.1 Log call — scripted for Priya, generic for everyone else
  logCall: (patientId, input) => {
    const state = get();
    const at = stamp();
    const p0 = state.patients.find((p) => p.id === patientId)!;
    const navigator = staffById(p0.navigatorId).name;
    const reached = input.outcome === 'Reached patient';

    if (patientId === HERO_IDS.priya && reached) {
      const steps = new Set(input.steps);
      const book = steps.has('book');
      set((s) => ({
        ...withPatient(s, patientId, (p) => {
          p.isOverdue = false;
          delete p.overdueDays;
          closeFollowUps(p, at);
          p.lastContactOn = DEMO_TODAY;
          p.risk = {
            score: 58,
            band: bandFor(58),
            trend: 'Falling',
            factors: [
              { label: '29 days since negative result; review booked today', weight: 28 },
              { label: 'Reached by phone today', weight: -6 },
              { label: 'Two unsuccessful transfers', weight: 16 },
              { label: 'Cost concern documented', weight: 14 },
              { label: 'Travel distance 38 km', weight: 6 },
            ],
            suggestedActions: [
              'Review consult with Dr. Mehta today at 16:30',
              'Counselling session with Ritu Malhotra after the review',
              'Discuss FET using the 2 vitrified blastocysts: FET package ₹65,000–₹85,000 versus a new stimulation cycle ₹1.8–2.2 lakh',
            ],
          };
          p.timeline.push({ at, type: 'Call', title: 'Call — Sneha Pawar', detail: input.notes, source: 'Anvaya' });
          if (book) {
            p.nextAppointment = { on: DEMO_TODAY, time: '16:30', withId: 'anil-mehta', type: 'Review consult' };
            p.nextExpectedEvent = { label: 'Review consult with Dr. Mehta, 16:30', dueOn: DEMO_TODAY };
            p.timeline.push({ at: `${DEMO_TODAY}T09:${String(nowMinute + 1).padStart(2, '0')}`, type: 'Consult', title: 'Appointment booked', detail: 'Review consult today at 16:30 with Dr. Anil Mehta.', source: 'Anvaya' });
          }
          if (steps.has('fet')) p.timeline.push({ at: `${DEMO_TODAY}T09:${String(nowMinute + 2).padStart(2, '0')}`, type: 'Note', title: 'FET cost estimate shared', detail: 'FET package ₹65,000–₹85,000, compared with ₹1.8–2.2 lakh for a new ICSI cycle.', source: 'Anvaya' });
          if (steps.has('counsellor')) {
            p.tasks.push(newTask(p, { title: 'Counselling: coping after second negative result, and cost of treatment', ownerRole: 'Counsellor', assigneeId: 'ritu-malhotra', dueOn: addDays(DEMO_TODAY, 1), priority: 'High', source: 'Manual', kind: 'admin' }));
            p.timeline.push({ at: `${DEMO_TODAY}T09:${String(nowMinute + 2).padStart(2, '0')}`, type: 'Note', title: 'Referred to counsellor — Ritu Malhotra', source: 'Anvaya' });
          }
          if (steps.has('confirm')) {
            p.messages.push({ ...PRIYA_MSG_CONFIRM }, { ...PRIYA_MSG_REPLY });
            p.timeline.push({ at: PRIYA_MSG_CONFIRM.at, type: 'Message', title: 'Appointment confirmation sent in Marathi', source: 'WhatsApp' });
            p.timeline.push({ at: PRIYA_MSG_REPLY.at, type: 'Message', title: 'Reply from Priya: "Rohan and I will come."', source: 'WhatsApp' });
          }
          p.timeline.sort((a, b) => a.at.localeCompare(b.at));
        }),
        appointments: book
          ? [...s.appointments, { id: 'A-PRIYA', patientId, doctorId: 'anil-mehta', time: '16:30', visitType: 'Review after negative result', brief: PRIYA_BRIEF, status: 'Booked' }]
          : s.appointments,
        flags: { ...s.flags, priyaCalled: true },
        notifications: [
          { id: 'N-priya', at, title: 'Priya Deshmukh: review consult booked', detail: 'Today 16:30 with Dr. Anil Mehta. Reached by phone by Sneha Pawar.', tone: 'positive', href: `/patients/${patientId}`, read: false },
          ...s.notifications,
        ],
      }));
      get().toast(book ? 'Call logged. Review consult booked for 16:30 today.' : 'Call logged.', 'positive');
      return;
    }

    set((s) =>
      withPatient(s, patientId, (p) => {
        p.timeline.push({ at, type: 'Call', title: `Call — ${navigator}`, detail: input.notes || input.outcome, source: 'Anvaya' });
        if (reached) {
          p.isOverdue = false;
          delete p.overdueDays;
          closeFollowUps(p, at);
          p.lastContactOn = DEMO_TODAY;
          const score = Math.max(5, p.risk.score - 18);
          p.risk = { ...p.risk, score, band: bandFor(score), trend: 'Falling', factors: [...p.risk.factors, { label: 'Reached by phone today', weight: -18 }] };
          p.risk.factors = normaliseFactors(p.risk.factors, score);
        }
      }),
    );
    get().toast(reached ? `Call logged. ${p0.name.split(' ')[0]} moved off the overdue list.` : `Call logged: ${input.outcome.toLowerCase()}.`, reached ? 'positive' : 'info');
  },

  sendWhatsApp: (patientId, text) => {
    const at = stamp();
    const p0 = get().patients.find((p) => p.id === patientId)!;
    set((s) =>
      withPatient(s, patientId, (p) => {
        p.messages.push({ id: `M-L${Date.now()}`, channel: 'WhatsApp', direction: 'Outbound', sentBy: staffById(p.navigatorId).name, at, textOriginal: text, status: 'Delivered' });
        p.timeline.push({ at, type: 'Message', title: 'WhatsApp sent', detail: text, source: 'WhatsApp' });
      }),
    );
    get().toast(`WhatsApp sent to ${p0.name}.`, 'positive');
  },

  bookAppointment: (patientId) => {
    const at = stamp();
    const p0 = get().patients.find((p) => p.id === patientId)!;
    const on = addDays(DEMO_TODAY, 1);
    set((s) =>
      withPatient(s, patientId, (p) => {
        p.nextAppointment = { on, time: '11:00', withId: p.consultantId, type: 'Consult' };
        p.nextExpectedEvent = { label: `Consult with ${staffById(p.consultantId).name}`, dueOn: on };
        p.isOverdue = false;
        delete p.overdueDays;
        closeFollowUps(p, at);
        p.timeline.push({ at, type: 'Consult', title: 'Appointment booked', detail: `13 Oct, 11:00 with ${staffById(p.consultantId).name}.`, source: 'Anvaya' });
      }),
    );
    get().toast(`Appointment booked for ${p0.name.split(' ')[0]}: 13 Oct, 11:00.`, 'positive');
  },

  referToCounsellor: (patientId) => {
    const at = stamp();
    const p0 = get().patients.find((p) => p.id === patientId)!;
    set((s) =>
      withPatient(s, patientId, (p) => {
        p.tasks.push(newTask(p, { title: 'Counselling referral from navigator', ownerRole: 'Counsellor', assigneeId: 'ritu-malhotra', dueOn: addDays(DEMO_TODAY, 1), priority: 'Normal', source: 'Manual', kind: 'admin' }));
        p.timeline.push({ at, type: 'Note', title: 'Referred to counsellor — Ritu Malhotra', source: 'Anvaya' });
      }),
    );
    get().toast(`${p0.name.split(' ')[0]} referred to Ritu Malhotra.`, 'positive');
  },

  escalateToDoctor: (patientId) => {
    const at = stamp();
    const p0 = get().patients.find((p) => p.id === patientId)!;
    set((s) =>
      withPatient(s, patientId, (p) => {
        p.tasks.push(newTask(p, { title: 'Escalated by navigator: review and advise', ownerRole: 'Doctor', assigneeId: p.consultantId, dueOn: DEMO_TODAY, priority: 'High', source: 'Manual', kind: 'clinical' }));
        p.timeline.push({ at, type: 'Alert', title: `Escalated to ${staffById(p.consultantId).name}`, source: 'Anvaya' });
      }),
    );
    get().toast(`Escalated to ${staffById(p0.consultantId).name}.`, 'info');
  },

  snooze: (patientId, days) => {
    const p0 = get().patients.find((p) => p.id === patientId)!;
    set((s) =>
      withPatient(s, patientId, (p) => {
        p.snoozedUntil = addDays(DEMO_TODAY, days);
        for (const t of p.tasks) if (t.status === 'Open' && t.kind === 'follow_up') t.status = 'Snoozed';
      }),
    );
    get().toast(`${p0.name.split(' ')[0]} snoozed for ${days} days.`, 'info');
  },
  unsnooze: (patientId) =>
    set((s) =>
      withPatient(s, patientId, (p) => {
        delete p.snoozedUntil;
        for (const t of p.tasks) if (t.status === 'Snoozed') t.status = 'Open';
      }),
    ),

  completeTask: (taskId) => {
    const at = stamp();
    const owner = get().patients.find((p) => p.tasks.some((t) => t.id === taskId));
    if (!owner) return;
    set((s) =>
      withPatient(s, owner.id, (p) => {
        const t = p.tasks.find((x) => x.id === taskId)!;
        t.status = 'Done';
        t.doneAt = at;
      }),
    );
    get().toast('Task marked done.', 'positive');
  },

  // -------------------------------------------------------------------------
  // §10.2 Live events
  triggerBeta: () => {
    if (get().flags.betaArrived) return get().toast('Beta result for Fatima Shaikh already received.');
    const at = `${DEMO_TODAY}T10:42`;
    set((s) => ({
      ...withPatient(s, HERO_IDS.fatima, (p) => {
        p.stage = 'early_pregnancy';
        p.stageEnteredOn = DEMO_TODAY;
        p.journey.push({ stage: 'early_pregnancy', on: DEMO_TODAY });
        p.gestationWeeks = 4;
        const c = p.cycles[p.cycles.length - 1]!;
        c.betaValue = 412;
        c.note = 'Beta hCG 412 mIU/mL (positive). Viability scan at 6–7 weeks.';
        p.nextExpectedEvent = { label: 'Doctor to call with result', dueOn: DEMO_TODAY };
        for (const t of p.tasks) if (t.status === 'Open') { t.status = 'Done'; t.doneAt = at; }
        p.tasks.push(newTask(p, { title: 'Call patient with result — Dr. Mehta', ownerRole: 'Doctor', assigneeId: 'anil-mehta', dueOn: DEMO_TODAY, dueTime: '11:30', priority: 'High', source: 'Rule', ruleId: 'R-06', kind: 'clinical', note: 'Sensitive: result is not messaged automatically.' }));
        p.tasks.push(newTask(p, { title: 'Book viability scan at 6–7 weeks', ownerRole: 'Nurse', assigneeId: 'lata-dsouza', dueOn: addDays(DEMO_TODAY, 2), priority: 'Normal', source: 'Rule', ruleId: 'R-08', kind: 'clinical' }));
        p.timeline.push({ at, type: 'Lab', title: 'Beta hCG 412 mIU/mL — positive', detail: 'Routed to Dr. Mehta to call the patient (R-06, sensitive). Not messaged automatically.', source: 'Lab' });
        p.risk = { ...p.risk, trend: 'Falling' };
      }),
      flags: { ...s.flags, betaArrived: true },
      notifications: [
        { id: 'N-beta', at, title: 'Beta hCG result: Fatima Shaikh — 412 mIU/mL (positive)', detail: 'Task created for Dr. Mehta to call with the result. Viability scan task created for nurse.', tone: 'positive', href: `/patients/${HERO_IDS.fatima}`, read: false },
        ...s.notifications,
      ],
    }));
    get().toast('Beta hCG result: Fatima Shaikh — 412 mIU/mL (positive)', 'positive');
  },

  triggerOhss: () => {
    if (get().flags.ohss) return get().toast('OHSS alert for Pooja Reddy is already active.');
    const at = POOJA_OHSS_MSG.at;
    set((s) => ({
      ...withPatient(s, HERO_IDS.pooja, (p) => {
        p.messages.push({ ...POOJA_OHSS_MSG });
        p.tasks.push(newTask(p, { title: 'Call now: possible OHSS (bloating, breathlessness, 3 days post-OPU)', ownerRole: 'Nurse', assigneeId: 'lata-dsouza', dueOn: DEMO_TODAY, dueTime: '09:15', priority: 'Critical', source: 'Patient message', kind: 'clinical' }));
        p.timeline.push({ at, type: 'Alert', title: 'Possible OHSS reported on WhatsApp', detail: 'Abdominal bloating, breathlessness lying down, reduced urine output. Assigned to Lata D’Souza.', source: 'WhatsApp' });
      }),
      flags: { ...s.flags, ohss: true, ohssDismissed: false },
      notifications: [
        { id: 'N-ohss', at, title: 'Critical: possible OHSS — Pooja Reddy', detail: "Assigned to Lata D'Souza — call now.", tone: 'critical', href: `/patients/${HERO_IDS.pooja}?tab=messages`, read: false },
        ...s.notifications,
      ],
    }));
  },
  dismissOhss: () => set((s) => ({ flags: { ...s.flags, ohssDismissed: true } })),

  triggerAnjali: () => {
    if (get().flags.anjaliEscalated) return get().toast('Anjali Nair’s scan is already escalated.');
    const at = `${DEMO_TODAY}T09:31`;
    set((s) => ({
      ...withPatient(s, HERO_IDS.anjali, (p) => {
        const t = p.tasks.find((x) => x.id === 'T-25102-1')!;
        t.priority = 'High';
        t.note = ANJALI_ESCALATION_NOTE;
        p.timeline.push({ at, type: 'Alert', title: 'Not checked in for 08:30 scan (R-05)', detail: ANJALI_ESCALATION_NOTE, source: 'Anvaya' });
      }),
      flags: { ...s.flags, anjaliEscalated: true },
      notifications: [
        { id: 'N-anjali', at, title: 'Anjali Nair not checked in for 08:30 scan', detail: "Day 8 of stimulation. Escalated to Lata D'Souza.", tone: 'attention', href: '/worklist?tab=today', read: false },
        ...s.notifications,
      ],
    }));
    get().toast("Anjali Nair not checked in for 08:30 scan. Escalated to Lata D'Souza.", 'info');
  },

  reset: () => {
    nowMinute = 20;
    set((s) => ({ ...initial(), tour: { open: false, step: 0 }, epoch: s.epoch + 1 }));
    get().toast('Demo reset');
  },

  updateRule: (id, patch) => set((s) => ({ rules: s.rules.map((r) => (r.id === id ? { ...r, ...patch } : r)) })),
  markSummarySeen: (id) => set((s) => (s.summariesSeen.includes(id) ? s : { summariesSeen: [...s.summariesSeen, id] })),
  markSummaryReviewed: (id) => set((s) => (s.summariesReviewed.includes(id) ? s : { summariesReviewed: [...s.summariesReviewed, id] })),
  setPipelineAnimated: () => set((s) => ({ flags: { ...s.flags, pipelineAnimated: true } })),
  setPriyaReplyShown: () => set((s) => ({ flags: { ...s.flags, priyaReplyShown: true } })),
  setTour: (tour) => set((s) => ({ tour: { ...s.tour, ...tour } })),
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),
}));

/** Keep factor weights summing to the score after a generic change. */
function normaliseFactors(factors: { label: string; weight: number }[], score: number) {
  const sum = factors.reduce((s, f) => s + f.weight, 0);
  if (sum === score) return factors;
  const out = factors.map((f) => ({ ...f }));
  out[0]!.weight += score - sum;
  return out;
}

export const usePatient = (id: string | undefined) => useDemo((s) => s.patients.find((p) => p.id === id));
