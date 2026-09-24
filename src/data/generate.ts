// Deterministic generator for background patients — CLAUDE.md §7.
// Seeded PRNG (mulberry32, seed 20261012). The generator is quota-driven: stage counts,
// overdue rules, risk bands and cryo holdings are assigned from explicit quotas so every
// KPI target holds exactly; the PRNG only varies names, places, dates and clinical detail.

import type {
  Appointment, Blastocyst, Channel, CryoItem, Cycle, Language, Message, Patient, ScheduleItem, StageId, Task, TimelineEvent, TreatmentType,
} from './types';
import { DEMO_TODAY, MAIN_PATH, stageById } from './constants';
import { addDays, daysSince } from '@/lib/dates';
import { makeRisk } from '@/lib/risk';

// ---------------------------------------------------------------------------
// PRNG
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261012);
const int = (a: number, b: number) => a + Math.floor(rand() * (b - a + 1));
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]!;
const chance = (p: number) => rand() < p;
const round5k = (n: number) => Math.round(n / 5000) * 5000;
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}
function weighted<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [v, w] of items) {
    if ((r -= w) <= 0) return v;
  }
  return items[items.length - 1]![0];
}

// ---------------------------------------------------------------------------
// Names and places (fictional combinations; staff surnames deliberately excluded)

interface Community {
  surnames: string[];
  female: string[];
  male: string[];
  lang: [Language, number][];
}

const COMMUNITIES: [Community, number][] = [
  [{
    surnames: ['Deshpande', 'Joshi', 'Gokhale', 'Sawant', 'Jadhav', 'Shinde', 'Kale', 'Bhosale', 'Gaikwad', 'Chavan', 'Naik', 'Rane', 'More', 'Salunkhe', 'Kadam', 'Mane', 'Apte', 'Phadke', 'Wagh', 'Thorat'],
    female: ['Snehal', 'Pallavi', 'Ashwini', 'Madhura', 'Rutuja', 'Shraddha', 'Gauri', 'Manasi', 'Aparna', 'Swati', 'Vaishali', 'Prajakta', 'Ketaki', 'Rasika', 'Tejaswini', 'Mrunal', 'Sayali', 'Amruta'],
    male: ['Sachin', 'Rahul', 'Amol', 'Nitin', 'Sameer', 'Prasad', 'Tushar', 'Ajinkya', 'Mandar', 'Omkar', 'Sagar', 'Kedar', 'Vinayak', 'Ninad'],
    lang: [['Marathi', 0.65], ['English', 0.35]],
  }, 0.34],
  [{
    surnames: ['Shah', 'Patel', 'Desai', 'Parikh', 'Mehra', 'Sanghvi', 'Doshi', 'Trivedi', 'Vora', 'Thakkar', 'Kothari', 'Dave'],
    female: ['Hetal', 'Krupa', 'Nirali', 'Dhara', 'Bhavna', 'Khushbu', 'Riddhi', 'Palak', 'Foram', 'Janvi', 'Hiral', 'Mansi'],
    male: ['Hardik', 'Chirag', 'Nirav', 'Jignesh', 'Ketan', 'Parth', 'Bhavin', 'Dhaval', 'Mihir', 'Rushabh'],
    lang: [['Gujarati', 0.55], ['English', 0.45]],
  }, 0.18],
  [{
    surnames: ['Sharma', 'Verma', 'Mishra', 'Tiwari', 'Pandey', 'Singh', 'Yadav', 'Srivastava', 'Chauhan', 'Dubey', 'Agarwal', 'Jain', 'Saxena', 'Tripathi'],
    female: ['Pooja', 'Ritu', 'Shweta', 'Priyanka', 'Anita', 'Komal', 'Nidhi', 'Sakshi', 'Divya', 'Ankita', 'Preeti', 'Shalini', 'Monika', 'Kiran'],
    male: ['Rajesh', 'Vikas', 'Manish', 'Deepak', 'Rohit', 'Ankit', 'Saurabh', 'Abhishek', 'Pankaj', 'Gaurav', 'Vivek', 'Alok'],
    lang: [['Hindi', 0.7], ['English', 0.3]],
  }, 0.2],
  [{
    surnames: ['Menon', 'Pillai', 'Rao', 'Naidu', 'Krishnan', 'Subramanian', 'Hegde', 'Kamath', 'Shenoy', 'Bhat', 'Venkatesh', 'Raghavan'],
    female: ['Lakshmi', 'Divya', 'Aishwarya', 'Revathi', 'Sowmya', 'Deepika', 'Keerthi', 'Nandini', 'Radhika', 'Shruthi', 'Vidya'],
    male: ['Arun', 'Karthik', 'Srinivas', 'Ganesh', 'Prakash', 'Vijay', 'Ramesh', 'Sandeep', 'Harish', 'Naveen'],
    lang: [['English', 1]],
  }, 0.12],
  [{
    surnames: ['Khan', 'Ansari', 'Siddiqui', 'Sheikh', 'Pathan', 'Mirza', 'Kazi', 'Momin', 'Chaudhary'],
    female: ['Ayesha', 'Zainab', 'Sana', 'Rukhsar', 'Nazia', 'Farah', 'Heena', 'Shabnam', 'Mehjabeen', 'Aafreen'],
    male: ['Imtiaz', 'Salman', 'Irfan', 'Javed', 'Faisal', 'Aamir', 'Shahid', 'Rizwan', 'Nadeem'],
    lang: [['Hindi', 0.6], ['English', 0.4]],
  }, 0.1],
  [{
    surnames: ['Fernandes', 'Pereira', 'Rodrigues', 'Dias', 'Lobo', 'Mascarenhas', 'Gomes', 'Pinto'],
    female: ['Sharon', 'Priscilla', 'Joanna', 'Leena', 'Melissa', 'Sonia', 'Cheryl', 'Rhea'],
    male: ['Glen', 'Joel', 'Anthony', 'Clinton', 'Nigel', 'Roshan', 'Warren'],
    lang: [['English', 1]],
  }, 0.06],
];

const LOCALITIES: [string, number][] = [
  ['Andheri West', 2], ['Andheri East', 4], ['Jogeshwari West', 5], ['Goregaon West', 8], ['Malad West', 12], ['Kandivali East', 15],
  ['Borivali West', 19], ['Dahisar East', 22], ['Mira Road', 27], ['Bandra West', 9], ['Khar West', 8], ['Santacruz East', 7],
  ['Vile Parle West', 5], ['Juhu', 5], ['Powai', 11], ['Ghatkopar East', 14], ['Vikhroli', 16], ['Kurla West', 12], ['Chembur', 18],
  ['Sion', 17], ['Dadar West', 16], ['Worli', 18], ['Lower Parel', 19], ['Mulund West', 22], ['Bhandup West', 19], ['Thane West', 34],
  ['Thane East', 36], ['Kalyan West', 52], ['Dombivli East', 50], ['Vashi', 28], ['Nerul', 33], ['Kharghar', 39], ['Panvel', 46], ['Airoli', 26],
];

const GYNAE_REFERRERS = ['Dr. Kavita Rao, Borivali', 'Dr. Meenal Sathe, Thane', 'Dr. Rekha Ahuja, Bandra', 'Dr. Sunil Pai, Chembur', 'Dr. Anjana Wadia, Malad', 'Dr. Leena Kamble, Vashi'];

const usedIds = new Set<string>(['P-24817', 'P-25102', 'P-25077', 'P-25143', 'P-24390', 'P-22761', 'P-18244', 'P-25010', 'P-23905']);
function newId(lo: number, hi: number) {
  for (;;) {
    const id = `P-${int(lo, hi)}`;
    if (!usedIds.has(id)) {
      usedIds.add(id);
      return id;
    }
  }
}

// ---------------------------------------------------------------------------
// Slots: every generated patient starts as a slot carrying its quota assignments.

type RuleId = 'R-01' | 'R-02' | 'R-03' | 'R-04' | 'R-07' | 'R-08' | 'R-09' | 'R-10' | 'R-11' | 'R-14';

interface Slot {
  stage: StageId;
  daysInStage: number;
  overdueRule?: RuleId;
  overdueDays?: number;
  highRisk?: boolean;
  embryos?: number; // stored embryos (count assigned later)
  embryoDisposition?: CryoItem['disposition'];
  frozenDaysAgo?: number;
  oocytes?: number;
  sperm?: number;
  fp?: boolean; // fertility preservation
  unreachable?: boolean;
  renewalSoon?: boolean;
  feeOverdue?: boolean;
  pausedEnded?: boolean;
  treatment?: TreatmentType;
  tag?: string;
}

const THRESHOLD: Record<RuleId, number> = { 'R-01': 7, 'R-02': 14, 'R-03': 10, 'R-04': 30, 'R-07': 21, 'R-08': 7, 'R-09': 84, 'R-10': 90, 'R-11': 180, 'R-14': 0 };

function slots(stage: StageId, n: number, make: (i: number) => Partial<Slot>): Slot[] {
  return Array.from({ length: n }, (_, i) => ({ stage, daysInStage: 0, ...make(i) }));
}

function buildSlots(): Slot[] {
  const S: Slot[] = [];
  const overdue = (rule: RuleId, lo: number, hi: number): Partial<Slot> => {
    const d = int(lo, hi);
    return { overdueRule: rule, overdueDays: d, daysInStage: THRESHOLD[rule] + d };
  };

  // Enquiry 46: 5 overdue (R-01)
  S.push(...slots('enquiry', 46, (i) => (i < 5 ? overdue('R-01', 2, 16) : { daysInStage: int(0, 6) })));
  // First consult 51 (+ Neha): 5 overdue (R-02)
  S.push(...slots('first_consult', 51, (i) => (i < 5 ? overdue('R-02', 2, 20) : { daysInStage: int(0, 13) })));
  // Work-up 48: 5 overdue (R-03). Work-up is counted from completion of tests.
  S.push(...slots('workup', 48, (i) => (i < 5 ? overdue('R-03', 3, 18) : { daysInStage: int(1, 9) })));
  // Plan & counselling 31: 5 overdue (R-04), plus one high-risk patient not yet overdue
  S.push(...slots('plan_counselling', 31, (i) => (i < 5 ? overdue('R-04', 3, 25) : i === 5 ? { daysInStage: 24, highRisk: true, tag: 'pre-overdue' } : { daysInStage: int(2, 28) })));
  // Stimulation 28 (+ Anjali). 6 carry a backup sperm sample.
  S.push(...slots('stimulation', 28, (i) => ({ daysInStage: int(1, 11), sperm: i < 6 ? 1 : undefined })));
  // OPU & embryology 13 (+ Pooja). 4 carry a backup sperm sample.
  S.push(...slots('opu_embryology', 13, (i) => ({ daysInStage: int(0, 5), sperm: i < 4 ? 1 : undefined })));
  // Awaiting transfer 57 (+ Sunita): 3 R-11, 2 R-10 overdue; 30 pending decision, 22 planned FET
  S.push(
    ...slots('awaiting_transfer', 57, (i) => {
      if (i < 3) {
        const o = overdue('R-11', 20, 140);
        return { ...o, embryos: 1, embryoDisposition: 'Pending decision', frozenDaysAgo: o.daysInStage };
      }
      if (i < 5) {
        const o = overdue('R-10', 5, 60);
        return { ...o, embryos: 1, embryoDisposition: 'Pending decision', frozenDaysAgo: o.daysInStage, tag: 'freeze-all' };
      }
      const d = int(6, 85);
      return { daysInStage: d, embryos: 1, embryoDisposition: i < 35 ? 'Pending decision' : 'Planned FET', frozenDaysAgo: d };
    }),
  );
  // Transfer & luteal 21: 12 with surplus embryos
  S.push(...slots('transfer_luteal', 21, (i) => ({ daysInStage: int(0, 3), ...(i < 12 ? { embryos: 1, embryoDisposition: 'Continue storage' as const, frozenDaysAgo: int(8, 120) } : {}) })));
  // Beta awaited 11 (+ Fatima): 5 with surplus embryos
  S.push(...slots('beta_awaited', 11, (i) => ({ daysInStage: int(4, 11), ...(i < 5 ? { embryos: 1, embryoDisposition: 'Continue storage' as const, frozenDaysAgo: int(15, 150) } : {}) })));
  // Early pregnancy 33 (+ Rashmi): 1 overdue (R-09), 14 with surplus embryos
  S.push(
    ...slots('early_pregnancy', 33, (i) => {
      if (i === 0) return { overdueRule: 'R-09', overdueDays: 6, daysInStage: 70, embryos: 1, embryoDisposition: 'Continue storage', frozenDaysAgo: 160 };
      return { daysInStage: int(3, 58), ...(i < 14 ? { embryos: 1, embryoDisposition: 'Continue storage' as const, frozenDaysAgo: int(90, 300) } : {}) };
    }),
  );
  // Review after negative 26 (+ Priya): 5 overdue (R-07); 9 recent with embryos; 1 high-risk not yet overdue
  S.push(
    ...slots('review_after_negative', 26, (i) => {
      if (i < 5) return overdue('R-07', 2, 30);
      if (i < 14) {
        const d = int(3, 19);
        return { daysInStage: d, embryos: 1, embryoDisposition: 'Pending decision', frozenDaysAgo: d + int(10, 40), highRisk: i === 5, tag: i === 5 ? 'distress' : undefined };
      }
      return { daysInStage: int(1, 20) };
    }),
  );
  // Paused by choice 38 (+ Kavita, Meera): 15 with long-stored embryos, 16 fertility preservation, 2 pause ended (R-14), 5 other
  S.push(
    ...slots('paused_by_choice', 38, (i) => {
      if (i < 15) {
        const f = int(200, 1400);
        return { daysInStage: Math.max(20, f - int(20, 150)), embryos: 1, embryoDisposition: 'Pending decision', frozenDaysAgo: f };
      }
      if (i < 31) {
        const f = int(40, 1500);
        return { daysInStage: f - int(0, 10), oocytes: 1, fp: true, frozenDaysAgo: f, treatment: 'FERTILITY_PRESERVATION' as const };
      }
      if (i < 33) {
        const o = overdue('R-14', 3, 20);
        return { ...o, pausedEnded: true, daysInStage: int(90, 180) };
      }
      return { daysInStage: int(20, 200) };
    }),
  );

  // Inactive patients with stored embryos: 42 (24 delivered, 6 obstetric handover, 12 exited)
  S.push(
    ...slots('delivered', 24, (i) => ({
      daysInStage: int(60, 1200), embryos: 1, frozenDaysAgo: int(420, 1900),
      embryoDisposition: i < 10 ? 'Pending decision' : 'Continue storage',
    })),
  );
  S.push(...slots('obstetric_handover', 6, () => ({ daysInStage: int(10, 150), embryos: 1, frozenDaysAgo: int(250, 700), embryoDisposition: 'Continue storage' })));
  S.push(
    ...slots('exited', 12, (i) => ({
      daysInStage: int(160, 900), embryos: 1, frozenDaysAgo: int(240, 1600),
      embryoDisposition: i < 2 ? 'Unreachable protocol' : 'Pending decision', unreachable: i < 2, feeOverdue: i < 4,
    })),
  );

  // High-risk quota among overdue: 18 (heroes add Priya, Neha, Kavita; plus 2 pre-overdue above = 23)
  const overdueSlots = S.filter((s) => s.overdueRule);
  const highPrefs: RuleId[] = ['R-07', 'R-07', 'R-07', 'R-07', 'R-04', 'R-04', 'R-04', 'R-02', 'R-02', 'R-02', 'R-03', 'R-03', 'R-03', 'R-01', 'R-01', 'R-11', 'R-11', 'R-14'];
  for (const rule of highPrefs) {
    const s = overdueSlots.find((x) => x.overdueRule === rule && !x.highRisk);
    if (s) s.highRisk = true;
  }

  // Embryo counts: sum to 461 − 13 (hero embryos) = 448
  const embryoSlots = S.filter((s) => s.embryos);
  for (const s of embryoSlots) s.embryos = weighted([[1, 0.2], [2, 0.3], [3, 0.26], [4, 0.14], [5, 0.07], [6, 0.03]]);
  balance(embryoSlots, 'embryos', 448, 1, 6);

  // Oocyte counts: 16 generated patients sum to 212 − 14 (Meera) = 198
  const oocyteSlots = S.filter((s) => s.oocytes);
  for (const s of oocyteSlots) s.oocytes = int(8, 16);
  balance(oocyteSlots, 'oocytes', 198, 6, 20);

  // Sperm: 10 backup-only samples above + 28 on 20 embryo patients (12 × 1, 8 × 2) = 38
  const spermCarriers = shuffle(embryoSlots.filter((s) => s.stage !== 'exited')).slice(0, 20);
  spermCarriers.forEach((s, i) => (s.sperm = i < 8 ? 2 : 1));

  // Storage renewals in the next 60 days: 10 generated (+ Kavita = 11)
  const renewalPool = shuffle(S.filter((s) => (s.embryos || s.oocytes) && !s.unreachable && (s.frozenDaysAgo ?? 0) > 200));
  renewalPool.slice(0, 10).forEach((s) => (s.renewalSoon = true));
  // A few overdue storage fees
  shuffle(S.filter((s) => s.embryos && (s.stage === 'delivered' || s.stage === 'paused_by_choice') && !s.feeOverdue)).slice(0, 3).forEach((s) => (s.feeOverdue = true));

  return S;
}

function balance(list: Slot[], key: 'embryos' | 'oocytes', target: number, min: number, max: number) {
  let sum = list.reduce((s, x) => s + (x[key] ?? 0), 0);
  let guard = 0;
  while (sum !== target && guard++ < 10_000) {
    const s = list[Math.floor(rand() * list.length)]!;
    const v = s[key]!;
    if (sum < target && v < max) {
      s[key] = v + 1;
      sum++;
    } else if (sum > target && v > min) {
      s[key] = v - 1;
      sum--;
    }
  }
}

// ---------------------------------------------------------------------------
// Clinical detail helpers

const GRADES_D5 = ['4AA', '4AB', '4BA', '4BB', '5AA', '4BC', '3AB', '3BB'];
const GRADES_D6 = ['4BB', '3BB', '4BC', '3BC', '4AB'];

function blastList(vitrified: number, transferred: number): Blastocyst[] {
  const out: Blastocyst[] = [];
  for (let i = 0; i < transferred; i++) out.push({ day: 5, grade: pick(['4AA', '4AB', '5AA', '4BA']), fate: 'Transferred' });
  for (let i = 0; i < vitrified; i++) {
    const d6 = chance(0.3);
    out.push({ day: d6 ? 6 : 5, grade: pick(d6 ? GRADES_D6 : GRADES_D5), fate: 'Vitrified' });
  }
  return out;
}

function makeCycle(pid: string, num: number, opuOn: string, vitrified: number, transferred: number, extra: Partial<Cycle>): Cycle {
  const blasts = vitrified + transferred;
  const pn = blasts + int(1, 3);
  const mii = pn + int(0, 3);
  const oocytes = mii + int(1, 3);
  const stimDays = int(9, 12);
  const startOn = addDays(opuOn, -(stimDays + 2));
  return {
    id: `C-${pid.slice(2)}-${num}`,
    number: num,
    type: 'IVF_ICSI',
    protocol: weighted([['Antagonist', 0.75], ['Long agonist', 0.15], ['Antagonist, agonist trigger', 0.1]]),
    startOn,
    stimDays,
    gonadotropins: pick(['rFSH 225 IU', 'rFSH 300 IU + hMG 75 IU', 'rFSH 150 IU', 'rFSH 225 IU + hMG 75 IU']),
    triggerOn: addDays(opuOn, -2),
    opuOn,
    oocytes,
    mii,
    fertilised2PN: pn,
    blastocysts: blastList(vitrified, transferred),
    outcome: 'Ongoing',
    ...extra,
  };
}

function clinicalFor(age: number, treatment: TreatmentType, stage: StageId) {
  const lowReserve = age >= 37 ? chance(0.6) : chance(0.2);
  const amh = treatment === 'FERTILITY_PRESERVATION' ? +(1.4 + rand() * 3).toFixed(1) : lowReserve ? +(0.5 + rand() * 1.1).toFixed(1) : +(1.8 + rand() * 4.2).toFixed(1);
  const afc = Math.max(3, Math.round(amh * 4 + int(-2, 3)));
  const dxPool: [string, number][] = [
    ['Unexplained infertility', 0.22], ['Tubal factor', 0.16], ['Polycystic ovary syndrome', 0.16], ['Endometriosis (stage II)', 0.1],
    ['Male factor (oligoasthenozoospermia)', 0.16], ['Diminished ovarian reserve', 0.12], ['Uterine fibroid (intramural, 2.8 cm)', 0.04], ['Recurrent implantation failure', 0.04],
  ];
  const diagnosis = treatment === 'FERTILITY_PRESERVATION' ? [pick(['Elective oocyte cryopreservation', 'Elective oocyte cryopreservation', 'Oncofertility: oocytes frozen before chemotherapy'])] : lowReserve ? ['Diminished ovarian reserve'] : [weighted(dxPool)];
  if (treatment !== 'FERTILITY_PRESERVATION' && chance(0.25) && diagnosis[0] !== 'Male factor (oligoasthenozoospermia)') diagnosis.push('Mild male factor');
  const early = stage === 'enquiry';
  const male = diagnosis.some((d) => d.toLowerCase().includes('male'));
  return {
    amh: early ? undefined : amh,
    afc: early ? undefined : afc,
    bmi: +(19.5 + rand() * 9).toFixed(1),
    tsh: +(0.9 + rand() * 2.8).toFixed(1),
    diagnosis: early ? ['Not yet assessed'] : diagnosis,
    semen: early || treatment === 'FERTILITY_PRESERVATION' ? undefined : male ? { concentration: int(5, 14), progressiveMotility: int(14, 30), morphology: int(1, 3) } : { concentration: int(20, 70), progressiveMotility: int(32, 55), morphology: int(4, 9) },
    infertilityYears: treatment === 'FERTILITY_PRESERVATION' ? 0 : int(1, 8),
    type: chance(0.78) ? ('Primary' as const) : ('Secondary' as const),
  };
}

// Journey path to reach a stage
function pathTo(slot: Slot): StageId[] {
  const idx = (s: StageId) => MAIN_PATH.indexOf(s);
  switch (slot.stage) {
    case 'review_after_negative':
      return [...MAIN_PATH.slice(0, idx('opu_embryology') + 1), ...(slot.embryos ? ['awaiting_transfer' as StageId] : []), 'transfer_luteal', 'beta_awaited', 'review_after_negative'];
    case 'paused_by_choice':
      if (slot.fp) return ['enquiry', 'first_consult', 'workup', 'stimulation', 'opu_embryology', 'paused_by_choice'];
      if (slot.embryos) return [...MAIN_PATH.slice(0, idx('awaiting_transfer') + 1), 'paused_by_choice'];
      return ['enquiry', 'first_consult', 'workup', 'plan_counselling', 'paused_by_choice'];
    case 'exited':
      return [...MAIN_PATH.slice(0, idx('awaiting_transfer') + 1), 'transfer_luteal', 'beta_awaited', 'review_after_negative', 'exited'];
    default:
      return MAIN_PATH.slice(0, idx(slot.stage) + 1);
  }
}

const TYPICAL: Partial<Record<StageId, number>> = {
  enquiry: 8, first_consult: 10, workup: 25, plan_counselling: 30, stimulation: 11, opu_embryology: 5, awaiting_transfer: 45,
  transfer_luteal: 11, beta_awaited: 1, early_pregnancy: 60, obstetric_handover: 200, review_after_negative: 25,
};

const CHANNELS: [Channel, number][] = [['WhatsApp', 0.62], ['Call', 0.3], ['SMS', 0.08]];

// ---------------------------------------------------------------------------
// Risk factor templates

function reasonFactor(slot: Slot): string {
  const d = slot.daysInStage;
  switch (slot.overdueRule) {
    case 'R-01': return `${d} days since enquiry, no consult booked`;
    case 'R-02': return `${d} days since first consult, no work-up booked`;
    case 'R-03': return `${d} days since work-up, no plan discussion`;
    case 'R-04': return `${d} days since plan, treatment not started`;
    case 'R-07': return `${d} days without contact after negative result`;
    case 'R-09': return 'Obstetric handover overdue';
    case 'R-10': return `${d} days since freeze-all, no FET plan`;
    case 'R-11': return `${Math.round(d / 30.4)} months with embryos stored, no FET plan`;
    case 'R-14': return `Pause ended ${slot.overdueDays} days ago, no contact`;
    default:
      return `${d} days in ${stageById(slot.stage).label.toLowerCase()}`;
  }
}

const EXTRA_FACTORS: [string, number][] = [
  ['Two unanswered messages', 1], ['One unanswered message', 1.2], ['Cost concern recorded', 1.1], ['Asked about EMI options', 0.6],
  ['Previous unsuccessful cycle', 0.8], ['Partner unable to attend visits', 0.5], ['Missed one scheduled visit', 0.7], ['Wellbeing screen: moderate distress', 0.5],
];

function splitScore(score: number, labels: string[]): { label: string; weight: number }[] {
  // First factor carries ~35–40%; the rest share the remainder, descending.
  const n = labels.length;
  const first = Math.round(score * (0.34 + rand() * 0.08));
  const rest = score - first;
  const raw = Array.from({ length: n - 1 }, (_, i) => n - 1 - i + rand());
  const tot = raw.reduce((a, b) => a + b, 0);
  const weights = raw.map((r) => Math.max(2, Math.round((r / tot) * rest)));
  const diff = rest - weights.reduce((a, b) => a + b, 0);
  weights[0] = weights[0]! + diff;
  return labels.map((label, i) => ({ label, weight: i === 0 ? first : weights[i - 1]! }));
}

const ACTIONS: Record<string, string[]> = {
  'R-01': ['Call to book a first consult', 'Share consult fee and what to bring', 'Offer an evening or Saturday slot'],
  'R-02': ['Call to book all work-up tests in one visit', 'Send the work-up checklist and lab timings', 'Share an itemised cost estimate'],
  'R-03': ['Book a plan discussion with the consultant', 'Share results summary by WhatsApp'],
  'R-04': ['Call to agree a start date', 'Offer financial counselling, including EMI options', 'Counsellor referral if hesitant'],
  'R-07': ['Personal call from navigator, not an automated message', 'Offer a review consult', 'Counsellor referral'],
  'R-09': ['Confirm obstetrician and send the handover letter'],
  'R-10': ['Call to plan FET', 'Share FET package cost (₹65,000–₹85,000)'],
  'R-11': ['Call to offer an FET planning consult', 'Share FET package cost (₹65,000–₹85,000)'],
  'R-14': ['Personal call to check in now the pause has ended', 'Offer a counsellor conversation'],
  default: ['No action needed now'],
};

// ---------------------------------------------------------------------------
// Build

export interface Generated {
  patients: Patient[];
  appointments: Appointment[];
  schedule: ScheduleItem[];
}

export function generateBackground(): Generated {
  const S = buildSlots();
  const patients: Patient[] = [];
  let spermOnlyCount = 0;

  for (const slot of S) {
    const community = weighted(COMMUNITIES);
    const surname = pick(community.surnames);
    const first = pick(community.female);
    const fp = !!slot.fp;
    const age = fp ? int(29, 38) : slot.stage === 'delivered' || slot.stage === 'exited' ? int(31, 44) : weighted([[int(26, 30), 0.25], [int(31, 35), 0.42], [int(36, 39), 0.23], [int(40, 44), 0.1]]);
    const single = fp && chance(0.85);
    const [locality, distanceKm] = pick(LOCALITIES);
    const referralSource = weighted<Patient['referralSource']>([['Self', 0.18], ['Gynaecologist referral', 0.3], ['Google', 0.22], ['Instagram', 0.1], ['Corporate tie-up', 0.07], ['Past patient', 0.13]]);
    const treatment: TreatmentType =
      slot.treatment ??
      (slot.embryos || ['stimulation', 'opu_embryology', 'transfer_luteal', 'beta_awaited', 'early_pregnancy', 'review_after_negative'].includes(slot.stage)
        ? slot.stage === 'awaiting_transfer' || slot.stage === 'transfer_luteal' ? (chance(0.6) ? 'FET' : 'IVF_ICSI') : 'IVF_ICSI'
        : slot.overdueRule ? weighted<TreatmentType>([['IVF_ICSI', 0.8], ['DONOR_OOCYTE', 0.2]])
        : weighted<TreatmentType>([['IVF_ICSI', 0.72], ['IUI', 0.14], ['DONOR_OOCYTE', 0.06], ['OI', 0.08]]));

    const idRange: Record<string, [number, number]> = {
      enquiry: [25150, 25399], first_consult: [24500, 25149], workup: [24400, 25120], plan_counselling: [24200, 25000], stimulation: [24100, 25100],
      opu_embryology: [24100, 25100], awaiting_transfer: [21000, 24900], transfer_luteal: [22500, 24900], beta_awaited: [22500, 24900],
      early_pregnancy: [22000, 24900], review_after_negative: [21500, 24800], paused_by_choice: [17000, 24800], delivered: [15500, 22500],
      obstetric_handover: [20500, 23500], exited: [15500, 23000],
    };
    const id = newId(...idRange[slot.stage]!);
    const stageEnteredOn = addDays(DEMO_TODAY, -slot.daysInStage);
    const consultantId = chance(0.6) ? 'anil-mehta' : 'shruti-kulkarni';
    const navigatorId = chance(0.55) ? 'sneha-pawar' : 'imran-sayyed';
    const language = weighted(community.lang);
    const preferredChannel = weighted(CHANNELS);

    // Journey dates, backfilled from the current stage
    const path = pathTo(slot);
    const journey: Patient['journey'] = [];
    let cursor = stageEnteredOn;
    for (let i = path.length - 1; i >= 0; i--) {
      const stage = path[i]!;
      if (i === path.length - 1) {
        journey.unshift({ stage, on: cursor });
        continue;
      }
      let gap = Math.max(1, Math.round((TYPICAL[stage] ?? 10) * (0.7 + rand() * 0.6)));
      if (stage === 'awaiting_transfer' && slot.frozenDaysAgo && path[i + 1] === 'paused_by_choice') {
        gap = Math.max(5, slot.frozenDaysAgo - slot.daysInStage);
      }
      if (stage === 'opu_embryology' && slot.frozenDaysAgo && path[i + 1] === 'awaiting_transfer') gap = 5;
      cursor = addDays(cursor, -gap);
      journey.unshift({ stage, on: cursor });
    }
    // Align freeze date with the journey where embryos exist
    const awaiting = journey.find((j) => j.stage === 'awaiting_transfer');
    const frozenOn = slot.frozenDaysAgo !== undefined
      ? slot.stage === 'awaiting_transfer' ? stageEnteredOn : awaiting?.on ?? addDays(DEMO_TODAY, -slot.frozenDaysAgo)
      : undefined;
    const opuOn = journey.find((j) => j.stage === 'opu_embryology')?.on;

    // Cycles
    const cycles: Cycle[] = [];
    const embryos = slot.embryos ?? 0;
    const pid = id;
    if (slot.fp && opuOn) {
      const o = slot.oocytes!;
      cycles.push({ id: `C-${pid.slice(2)}-1`, number: 1, type: 'FERTILITY_PRESERVATION', protocol: 'Antagonist, agonist trigger', startOn: addDays(opuOn, -12), stimDays: 10, gonadotropins: 'rFSH 225 IU', triggerOn: addDays(opuOn, -2), opuOn, oocytes: o + int(1, 3), mii: o, outcome: 'Cancelled', note: `${o} MII oocytes vitrified. No transfer planned.` });
    } else if (opuOn) {
      const betaOn = journey.find((j) => j.stage === 'beta_awaited')?.on;
      const transferOn = journey.find((j) => j.stage === 'transfer_luteal')?.on;
      const transferred = transferOn && (!awaiting || (awaiting && slot.stage !== 'awaiting_transfer' && slot.stage !== 'paused_by_choice')) ? 1 : 0;
      const isFreezeAll = !!awaiting;
      let outcome: Cycle['outcome'] = 'Ongoing';
      let betaValue: Cycle['betaValue'];
      if (slot.stage === 'review_after_negative' || slot.stage === 'exited') {
        outcome = 'Negative';
        betaValue = '<2';
      } else if (slot.stage === 'early_pregnancy' || slot.stage === 'obstetric_handover' || slot.stage === 'delivered') {
        outcome = 'Clinical pregnancy';
        betaValue = int(180, 1400);
      } else if (isFreezeAll && !transferOn) {
        outcome = 'Cancelled';
      }
      if (isFreezeAll && transferOn) {
        // ICSI with freeze-all, then an FET
        const all = makeCycle(pid, 1, opuOn, embryos + 1, 0, { outcome: 'Cancelled', note: 'Freeze-all.' });
        cycles.push(all);
        cycles.push({ id: `C-${pid.slice(2)}-2`, number: 2, type: 'FET', protocol: pick(['HRT FET', 'Natural FET']), startOn: addDays(transferOn, -15), blastocysts: [{ day: 5, grade: pick(['4AA', '4AB', '4BA']), fate: 'Transferred' }], transferOn, endometriumMm: +(7.6 + rand() * 2.4).toFixed(1), betaOn, betaValue, outcome });
      } else {
        const c = makeCycle(pid, 1, opuOn, embryos, transferred, {
          transferOn: transferred ? transferOn : undefined,
          endometriumMm: transferred ? +(7.6 + rand() * 2.4).toFixed(1) : undefined,
          betaOn: transferred ? betaOn : undefined,
          betaValue: transferred ? betaValue : undefined,
          outcome: slot.stage === 'stimulation' ? 'Ongoing' : isFreezeAll && !transferOn ? 'Cancelled' : outcome,
          note: isFreezeAll && !transferOn ? 'Freeze-all.' : undefined,
        });
        if (slot.stage === 'opu_embryology') {
          delete c.blastocysts;
          c.note = `Embryos in culture (day ${slot.daysInStage}).`;
        }
        cycles.push(c);
      }
    } else if (slot.stage === 'stimulation') {
      cycles.push({ id: `C-${pid.slice(2)}-1`, number: 1, type: treatment === 'IUI' ? 'IUI' : 'IVF_ICSI', protocol: treatment === 'IUI' ? 'Letrozole + low-dose FSH' : 'Antagonist', startOn: stageEnteredOn, stimDays: slot.daysInStage + 1, gonadotropins: pick(['rFSH 225 IU', 'rFSH 150 IU', 'rFSH 300 IU + hMG 75 IU']), outcome: 'Ongoing' });
    }

    // Cryo
    const cryo: CryoItem[] = [];
    const tank = () => `Tank ${int(1, 4)}`;
    const renewal = () => (slot.renewalSoon ? addDays(DEMO_TODAY, int(4, 58)) : addDays(DEMO_TODAY, int(75, 350)));
    const lastContact = slot.unreachable ? addDays(DEMO_TODAY, -int(300, 500)) : addDays(DEMO_TODAY, -int(2, Math.max(3, Math.min(200, slot.daysInStage + 2))));
    if (embryos && frozenOn) {
      const grades = blastList(embryos, 0);
      const d5 = grades.filter((g) => g.day === 5).length >= grades.length / 2;
      cryo.push({
        id: `CR-${pid.slice(2)}-1`, kind: 'Embryo', count: embryos, grade: grades.map((g) => g.grade).join(', '), dayFrozen: d5 ? 5 : 6, frozenOn,
        tank: tank(), canister: pick(['A', 'B', 'C', 'D', 'E', 'F']), cane: String(int(1, 30)), storageRenewalDue: renewal(),
        consentValidUntil: addDays(frozenOn, 365 * 5 + int(0, 30)), feeStatus: slot.feeOverdue ? 'Overdue' : slot.renewalSoon && chance(0.5) ? 'Due' : 'Paid',
        lastContactOn: lastContact, contactAttempts: slot.unreachable ? 3 : slot.embryoDisposition === 'Pending decision' && chance(0.3) ? int(1, 2) : 0,
        disposition: slot.embryoDisposition ?? 'Continue storage',
        attemptsLog: slot.unreachable ? [
          { on: addDays(DEMO_TODAY, -int(40, 60)), channel: 'Call', outcome: 'No answer' },
          { on: addDays(DEMO_TODAY, -int(25, 38)), channel: 'WhatsApp', outcome: 'Not delivered' },
          { on: addDays(DEMO_TODAY, -int(8, 20)), channel: 'Registered letter', outcome: 'Returned undelivered' },
        ] : undefined,
      });
      if (cryo[0]!.consentValidUntil <= DEMO_TODAY) cryo[0]!.consentValidUntil = addDays(DEMO_TODAY, int(90, 700));
    }
    if (slot.oocytes && frozenOn) {
      cryo.push({ id: `CR-${pid.slice(2)}-1`, kind: 'Oocytes', count: slot.oocytes, grade: 'MII', frozenOn, tank: pick(['Tank 3', 'Tank 4']), canister: pick(['A', 'B', 'C', 'D', 'E', 'F']), cane: String(int(1, 30)), storageRenewalDue: renewal(), consentValidUntil: addDays(frozenOn, 365 * 10), feeStatus: slot.feeOverdue ? 'Overdue' : 'Paid', lastContactOn: lastContact, contactAttempts: 0, disposition: 'Continue storage' });
    }
    if (slot.sperm) {
      const on = frozenOn ?? addDays(DEMO_TODAY, -int(1, 10));
      if (!frozenOn) spermOnlyCount++;
      cryo.push({ id: `CR-${pid.slice(2)}-S`, kind: 'Sperm', count: slot.sperm, frozenOn: on, tank: 'Tank 4', canister: pick(['E', 'F']), cane: String(int(1, 30)), storageRenewalDue: slot.renewalSoon ? cryo[0]?.storageRenewalDue ?? addDays(DEMO_TODAY, int(75, 350)) : addDays(on, 365 + int(0, 30)) > addDays(DEMO_TODAY, 60) ? addDays(on, 365 + int(0, 30)) : addDays(DEMO_TODAY, int(75, 350)), consentValidUntil: addDays(on, 365 * 5), feeStatus: 'Paid', lastContactOn: lastContact, contactAttempts: 0, disposition: 'Continue storage' });
    }

    // Risk
    let score: number;
    if (slot.highRisk) score = int(70, 80);
    else if (slot.overdueRule) score = int(45, 68);
    else score = weighted([[int(6, 24), 0.6], [int(25, 39), 0.28], [int(40, 62), 0.12]]);
    if (slot.stage === 'delivered' || slot.stage === 'obstetric_handover') score = int(3, 12);
    const labels: string[] = [];
    labels.push(slot.overdueRule ? reasonFactor(slot) : slot.tag === 'pre-overdue' ? `Plan given ${slot.daysInStage} days ago, start date not fixed` : slot.tag === 'distress' ? 'Wellbeing screen: high distress' : score >= 25 ? reasonFactor(slot) : 'On track for this stage');
    const extras = shuffle(EXTRA_FACTORS.map(([l]) => l)).slice(0, score >= 40 ? int(2, 3) : 1);
    if (slot.tag === 'pre-overdue') extras.splice(0, extras.length, 'Cost concern recorded', 'Two unanswered messages');
    labels.push(...extras);
    if (distanceKm >= 25 && score >= 25) labels.push(`Travel distance ${distanceKm} km`);
    if (age >= 37 && score >= 40) labels.push(`Age ${age}: time-sensitive`);
    const factors = splitScore(score, labels.slice(0, score < 15 ? 1 : labels.length));
    const risk = makeRisk(factors, ACTIONS[slot.overdueRule ?? 'default'] ?? ACTIONS.default!, slot.overdueRule ? (slot.highRisk ? 'Rising' : pick(['Rising', 'Stable'])) : score >= 40 ? 'Rising' : pick(['Stable', 'Stable', 'Falling']));

    // Value of the next treatment step
    let value = 0;
    const early = ['enquiry', 'first_consult', 'workup', 'plan_counselling'].includes(slot.stage);
    if (early) {
      value = treatment === 'IVF_ICSI' ? round5k(int(220_000, 300_000)) : treatment === 'DONOR_OOCYTE' ? round5k(int(340_000, 390_000)) : treatment === 'IUI' ? round5k(int(20_000, 35_000)) : round5k(int(10_000, 20_000));
    } else if (slot.stage === 'stimulation' || slot.stage === 'opu_embryology') value = round5k(int(185_000, 220_000));
    else if (embryos) value = round5k(int(65_000, 85_000));
    else if (slot.stage === 'review_after_negative' || slot.stage === 'paused_by_choice') value = slot.fp ? 20_000 : round5k(int(180_000, 220_000));

    // Tasks, messages, timeline
    const tasks: Task[] = [];
    const messages: Message[] = [];
    const timeline: TimelineEvent[] = [];
    const firstName = first;
    let lastContactOn = addDays(DEMO_TODAY, -int(0, Math.min(10, slot.daysInStage)));

    if (slot.overdueRule) {
      const firedOn = addDays(DEMO_TODAY, -slot.overdueDays!);
      const titleByRule: Record<RuleId, string> = {
        'R-01': `Call ${firstName}: enquiry with no first consult booked`,
        'R-02': `Call ${firstName}: no work-up booked after first consult`,
        'R-03': `Call ${firstName}: work-up complete, no plan discussion`,
        'R-04': `Call ${firstName}: plan given, treatment not started`,
        'R-07': `Call ${firstName}: no review consult after negative result`,
        'R-08': `Book viability scan for ${firstName}`,
        'R-09': `Obstetric handover for ${firstName}`,
        'R-10': `Call ${firstName}: freeze-all, no FET plan`,
        'R-11': `Call ${firstName}: embryos stored, no FET plan`,
        'R-14': `Call ${firstName}: pause period ended`,
      };
      tasks.push({ id: `T-${pid.slice(2)}-1`, patientId: id, title: titleByRule[slot.overdueRule], ownerRole: 'Navigator', assigneeId: navigatorId, dueOn: firedOn, priority: slot.highRisk ? 'High' : 'Normal', status: 'Open', source: 'Rule', ruleId: slot.overdueRule, kind: 'follow_up' });
      timeline.push({ at: `${firedOn}T09:00`, type: 'Alert', title: `Rule ${slot.overdueRule} fired`, detail: `Task created for ${navigatorId === 'sneha-pawar' ? 'Sneha Pawar' : 'Imran Sayyed'}.`, source: 'Anvaya' });
      lastContactOn = addDays(stageEnteredOn, int(0, 2));
      if (lastContactOn > DEMO_TODAY) lastContactOn = DEMO_TODAY;
      const unanswered = factors.some((f) => f.label.includes('unanswered')) ? (factors.some((f) => f.label.startsWith('Two')) ? 2 : 1) : 0;
      const sensitive = slot.overdueRule === 'R-07' || slot.overdueRule === 'R-14';
      for (let m = 0; m < unanswered; m++) {
        const at = `${addDays(stageEnteredOn, Math.max(1, Math.round(slot.daysInStage * (0.45 + 0.25 * m))))}T${pick(['10:15', '11:40', '15:05', '17:30'])}`;
        messages.push({
          id: `M-${pid.slice(2)}-${m + 1}`, channel: 'WhatsApp', direction: 'Outbound', sentBy: sensitive ? (navigatorId === 'sneha-pawar' ? 'Sneha Pawar' : 'Imran Sayyed') : 'Automated', at,
          textOriginal: sensitive ? `Hello ${firstName}, we are thinking of you. Whenever you are ready, we can set up a time to talk with your doctor.` : `Hello ${firstName}, this is Aarambh Fertility Centre. Would you like us to book your next visit? Reply with a day that suits you.`,
          status: 'Unanswered',
        });
      }
    }

    // Journey timeline
    const SRC: Partial<Record<StageId, TimelineEvent['source']>> = { enquiry: 'EMR', first_consult: 'EMR', workup: 'Lab', plan_counselling: 'EMR', stimulation: 'IVF software', opu_embryology: 'IVF software', awaiting_transfer: 'IVF software', transfer_luteal: 'IVF software', beta_awaited: 'Lab', early_pregnancy: 'Lab', review_after_negative: 'Lab', paused_by_choice: 'EMR', obstetric_handover: 'EMR', delivered: 'EMR', exited: 'EMR' };
    const TITLE: Partial<Record<StageId, string>> = {
      enquiry: `Enquiry via ${referralSource === 'Gynaecologist referral' ? 'gynaecologist referral' : referralSource.toLowerCase()}`,
      first_consult: `First consult — ${consultantId === 'anil-mehta' ? 'Dr. Anil Mehta' : 'Dr. Shruti Kulkarni'}`,
      workup: 'Work-up complete', plan_counselling: 'Treatment plan discussed', stimulation: 'Stimulation started',
      opu_embryology: 'Oocyte pick-up', awaiting_transfer: `${embryos} embryo${embryos === 1 ? '' : 's'} vitrified`, transfer_luteal: 'Embryo transfer',
      beta_awaited: 'Beta hCG drawn', early_pregnancy: 'Beta hCG positive', review_after_negative: 'Beta hCG negative', paused_by_choice: 'Chose to pause treatment',
      obstetric_handover: 'Handed over to obstetrician', delivered: 'Delivered', exited: 'Closed: no further treatment planned',
    };
    const TYPE: Partial<Record<StageId, TimelineEvent['type']>> = { enquiry: 'Call', first_consult: 'Consult', workup: 'Investigation', plan_counselling: 'Consult', stimulation: 'Procedure', opu_embryology: 'Procedure', awaiting_transfer: 'Procedure', transfer_luteal: 'Procedure', beta_awaited: 'Lab', early_pregnancy: 'Lab', review_after_negative: 'Lab', paused_by_choice: 'Consult', obstetric_handover: 'Note', delivered: 'Note', exited: 'Note' };
    for (const j of journey) {
      if (j.stage === 'awaiting_transfer' && !embryos && !slot.oocytes) continue;
      if (j.stage === 'opu_embryology' && slot.fp) {
        timeline.push({ at: `${j.on}T08:30`, type: 'Procedure', title: `OPU — ${slot.oocytes} MII oocytes vitrified`, source: 'IVF software' });
        continue;
      }
      timeline.push({ at: `${j.on}T${pick(['09:15', '10:30', '11:45', '12:30', '15:00', '16:20'])}`, type: TYPE[j.stage] ?? 'Note', title: TITLE[j.stage] ?? stageById(j.stage).label, source: SRC[j.stage] ?? 'EMR' });
    }
    timeline.sort((a, b) => a.at.localeCompare(b.at));

    // Next expected event
    const NEXT: Partial<Record<StageId, string>> = {
      enquiry: 'First consult', first_consult: 'Work-up booking', workup: 'Plan discussion', plan_counselling: 'Treatment start', stimulation: 'Trigger and OPU',
      opu_embryology: 'Day-5 embryology update', awaiting_transfer: 'Frozen embryo transfer', transfer_luteal: 'Beta hCG', beta_awaited: 'Beta hCG result',
      early_pregnancy: 'Next pregnancy scan', review_after_negative: 'Review consult', paused_by_choice: 'Check-in after pause', obstetric_handover: 'Delivery',
      delivered: 'Storage review', exited: 'Storage decision',
    };
    const threshold = slot.overdueRule ? THRESHOLD[slot.overdueRule] : stageById(slot.stage).expectedDurationDays;
    const nextDue = slot.overdueRule ? addDays(stageEnteredOn, threshold) : addDays(stageEnteredOn, Math.max(slot.daysInStage + int(1, 7), threshold));

    const pkg = early ? 'Consultation' : slot.fp ? 'Elective oocyte freezing' : embryos && ['delivered', 'obstetric_handover', 'exited', 'paused_by_choice'].includes(slot.stage) ? 'Embryo storage (annual)' : treatment === 'FET' ? 'FET package' : 'ICSI cycle';
    const pausedUntil = slot.stage === 'paused_by_choice' ? (slot.pausedEnded ? addDays(DEMO_TODAY, -slot.overdueDays!) : addDays(DEMO_TODAY, slot.fp ? int(700, 2500) : int(20, 240))) : undefined;

    if (slot.overdueRule === 'R-14') lastContactOn = stageEnteredOn;

    patients.push({
      id,
      name: `${first} ${surname}`,
      age,
      partner: single ? undefined : { name: `${pick(community.male)} ${surname}`, age: age + int(0, 6) },
      locality,
      distanceKm,
      language,
      phoneMasked: `+91 9${int(0, 9)}•• ••• ${String(int(0, 999)).padStart(3, '0')}`,
      referralSource,
      referrerName: referralSource === 'Gynaecologist referral' ? pick(GYNAE_REFERRERS) : undefined,
      consultantId,
      navigatorId,
      treatmentType: treatment,
      stage: slot.stage,
      stageEnteredOn,
      nextExpectedEvent: { label: NEXT[slot.stage] ?? 'Follow-up', dueOn: nextDue },
      isOverdue: !!slot.overdueRule,
      overdueDays: slot.overdueDays,
      overdueRuleId: slot.overdueRule,
      risk,
      estimatedValueINR: value,
      clinical: clinicalFor(age, treatment, slot.stage),
      cycles,
      cryo,
      timeline,
      messages,
      tasks,
      financial: {
        package: pkg,
        paidINR: early ? int(1, 3) * 1_000 + 500 : pkg === 'Embryo storage (annual)' ? 18_000 : round5k(int(60_000, 210_000)),
        dueINR: slot.feeOverdue ? 18_000 : chance(0.15) && !early ? round5k(int(10_000, 60_000)) : 0,
        emi: chance(0.12) ? true : undefined,
      },
      wellbeing: chance(0.5) || slot.tag === 'distress' ? { lastScreenOn: addDays(DEMO_TODAY, -int(5, 90)), score: slot.tag === 'distress' ? 19 : int(3, 14), band: slot.tag === 'distress' ? 'High distress' : undefined } : undefined,
      pausedUntil,
      preferredChannel,
      lastContactOn: slot.unreachable ? lastContact : lastContactOn,
      journey,
      gestationWeeks: slot.stage === 'early_pregnancy' ? Math.min(11, 4 + Math.floor(slot.daysInStage / 7)) : undefined,
    });
    if (patients[patients.length - 1]!.wellbeing?.score !== undefined) {
      const w = patients[patients.length - 1]!.wellbeing!;
      w.band = w.band ?? (w.score! >= 15 ? 'High distress' : w.score! >= 10 ? 'Moderate' : 'Low');
    }
  }
  void spermOnlyCount;

  // R-09 patient: 12 weeks + 6 days, handover not done
  const r09 = patients.find((p) => p.overdueRuleId === 'R-09')!;
  r09.gestationWeeks = 12;
  r09.risk.factors[0]!.label = '12 weeks 6 days pregnant, obstetric handover not done';

  const { appointments, schedule } = buildToday(patients);
  return { patients, appointments, schedule };
}

// ---------------------------------------------------------------------------
// Today: consults (Doctor's Day), scans and procedures, due-today tasks

function buildToday(patients: Patient[]): { appointments: Appointment[]; schedule: ScheduleItem[] } {
  const taken = new Set<string>();
  const find = (pred: (p: Patient) => boolean) => {
    const p = patients.find((x) => !taken.has(x.id) && !x.isOverdue && x.risk.score < 70 && pred(x));
    if (!p) throw new Error('generate: no patient matches appointment slot');
    taken.add(p.id);
    return p;
  };

  interface Spec { doctor: string; time: string; visit: string; brief: string; pick: (p: Patient) => boolean; apply?: (p: Patient) => void }
  const specs: Spec[] = [
    // Dr. Anil Mehta — 9
    { doctor: 'anil-mehta', time: '09:30', visit: 'New consult', pick: (p) => p.stage === 'enquiry',
      brief: 'New consult: 33 y, primary infertility 3 years, irregular cycles; referred by gynaecologist. No prior investigations.',
      apply: (p) => { p.age = 33; p.referralSource = 'Gynaecologist referral'; p.referrerName = 'Dr. Kavita Rao, Borivali'; p.clinical.infertilityYears = 3; p.clinical.type = 'Primary'; p.clinical.diagnosis = ['Oligomenorrhoea: PCOS to be excluded']; } },
    { doctor: 'anil-mehta', time: '10:00', visit: 'Work-up review', pick: (p) => p.stage === 'workup',
      brief: 'Work-up review: AMH 0.8 ng/mL, AFC 5; semen normal. Discuss low ovarian reserve and options, including donor oocytes.',
      apply: (p) => { p.clinical.amh = 0.8; p.clinical.afc = 5; p.clinical.diagnosis = ['Diminished ovarian reserve']; p.clinical.semen = { concentration: 46, progressiveMotility: 42, morphology: 6 }; p.age = Math.max(p.age, 37); } },
    { doctor: 'anil-mehta', time: '10:30', visit: 'Stimulation review', pick: (p) => p.stage === 'stimulation' && p.treatmentType === 'IVF_ICSI',
      brief: 'Stimulation day 7, antagonist: 11 follicles, lead 15 mm, E2 980 pg/mL. Consider trigger timing.',
      apply: (p) => setStimDay(p, 7, 'Day-7 scan: 11 follicles, lead 15 mm. E2 980 pg/mL.') },
    { doctor: 'anil-mehta', time: '11:00', visit: 'New consult', pick: (p) => p.stage === 'enquiry',
      brief: 'New consult: 38 y, secondary infertility 2 years after one live birth; AMH 1.1 ng/mL from an outside lab.',
      apply: (p) => { p.age = 38; p.clinical.type = 'Secondary'; p.clinical.infertilityYears = 2; p.clinical.amh = 1.1; p.clinical.diagnosis = ['Secondary infertility']; } },
    { doctor: 'anil-mehta', time: '11:30', visit: 'Plan & counselling', pick: (p) => p.stage === 'plan_counselling' && p.treatmentType === 'IVF_ICSI',
      brief: 'Plan discussion: bilateral tubal block on HSG; ICSI advised. Asked about EMI; consent forms pending.',
      apply: (p) => { p.clinical.diagnosis = ['Tubal factor (bilateral block on HSG)']; p.financial.emi = true; } },
    { doctor: 'anil-mehta', time: '12:00', visit: 'Pregnancy scan', pick: (p) => p.stage === 'early_pregnancy' && p.cycles.length > 0,
      brief: 'Viability scan at 7 weeks after FET; beta hCG 612 mIU/mL on 22 Sep; mild spotting reported last week.',
      apply: (p) => { p.gestationWeeks = 7; p.stageEnteredOn = '2026-09-22'; p.journey[p.journey.length - 1]!.on = '2026-09-22'; const c = p.cycles[p.cycles.length - 1]!; c.betaOn = '2026-09-22'; c.betaValue = 612; c.transferOn = '2026-09-11'; } },
    { doctor: 'anil-mehta', time: '14:00', visit: 'Work-up review', pick: (p) => p.stage === 'workup',
      brief: 'Work-up review: semen concentration 4 M/mL, progressive motility 18%. Discuss ICSI; consider andrology referral.',
      apply: (p) => { p.clinical.semen = { concentration: 4, progressiveMotility: 18, morphology: 2 }; p.clinical.diagnosis = ['Severe male factor (oligoasthenozoospermia)']; } },
    { doctor: 'anil-mehta', time: '14:30', visit: 'FET planning', pick: (p) => p.stage === 'awaiting_transfer' && p.cryo[0]?.disposition === 'Planned FET' && p.cryo[0]!.count === 3,
      brief: 'FET planning: 3 blastocysts vitrified in August. Endometrium 5.2 mm on baseline scan; plan HRT FET.',
      apply: (p) => { p.stageEnteredOn = '2026-08-21'; p.journey[p.journey.length - 1]!.on = '2026-08-21'; p.cryo[0]!.frozenOn = '2026-08-21'; } },
    { doctor: 'anil-mehta', time: '15:00', visit: 'Review after negative result', pick: (p) => p.stage === 'review_after_negative' && p.cryo.some((c) => c.kind === 'Embryo' && c.count === 2),
      brief: 'Review after negative FET; 2 blastocysts remain in storage. Wellbeing screen: moderate distress.',
      apply: (p) => { p.wellbeing = { lastScreenOn: '2026-10-05', score: 12, band: 'Moderate' }; } },
    // Dr. Shruti Kulkarni — 5
    { doctor: 'shruti-kulkarni', time: '09:45', visit: 'New consult', pick: (p) => p.stage === 'enquiry',
      brief: 'New consult: 29 y, primary infertility 2 years; husband works in Dubai and visits monthly. Consider sperm freezing at first visit.',
      apply: (p) => { p.age = 29; p.clinical.infertilityYears = 2; p.clinical.type = 'Primary'; } },
    { doctor: 'shruti-kulkarni', time: '10:30', visit: 'IUI planning', pick: (p) => p.stage === 'plan_counselling' && p.treatmentType === 'IUI',
      brief: 'IUI planning: unexplained infertility, patent tubes on HSG; 3 cycles of letrozole ovulation induction without conception.',
      apply: (p) => { p.clinical.diagnosis = ['Unexplained infertility']; } },
    { doctor: 'shruti-kulkarni', time: '11:15', visit: 'Stimulation review', pick: (p) => p.stage === 'stimulation' && p.treatmentType === 'IVF_ICSI',
      brief: 'Stimulation day 10, antagonist: 7 follicles ≥ 17 mm, E2 1,850 pg/mL. Consider trigger tonight for OPU on 14 Oct.',
      apply: (p) => setStimDay(p, 10, 'Day-10 scan: 7 follicles ≥ 17 mm. E2 1,850 pg/mL.') },
    { doctor: 'shruti-kulkarni', time: '12:00', visit: 'Work-up review', pick: (p) => p.stage === 'workup',
      brief: 'Work-up review: TSH 6.8 mIU/L, anti-TPO positive. Consider levothyroxine before stimulation.',
      apply: (p) => { p.clinical.tsh = 6.8; p.clinical.diagnosis = [...p.clinical.diagnosis.filter((d) => d !== 'Not yet assessed'), 'Subclinical hypothyroidism']; } },
    { doctor: 'shruti-kulkarni', time: '15:30', visit: 'Pregnancy scan', pick: (p) => p.stage === 'early_pregnancy' && p.cycles.length > 0,
      brief: 'Scan at 9 weeks after ICSI; twin pregnancy seen on the 6-week scan. Discuss the twin care pathway.',
      apply: (p) => { p.gestationWeeks = 9; p.clinical.diagnosis = [...p.clinical.diagnosis, 'Dichorionic twin pregnancy']; } },
  ];

  const appointments: Appointment[] = specs.map((s, i) => {
    const p = find(s.pick);
    p.consultantId = s.doctor;
    s.apply?.(p);
    p.nextAppointment = { on: DEMO_TODAY, time: s.time, withId: s.doctor, type: s.visit };
    return { id: `A-${String(i + 1).padStart(2, '0')}`, patientId: p.id, doctorId: s.doctor, time: s.time, visitType: s.visit, brief: s.brief, status: s.time < '09:10' ? 'Checked in' : 'Booked' };
  });

  // Scans and procedures scheduled today
  const schedule: ScheduleItem[] = [
    { id: 'S-01', patientId: 'P-25102', time: '08:30', kind: 'Scan', label: 'Follicle-tracking scan and E2 (day 8)', assigneeId: 'lata-dsouza' },
    { id: 'S-02', patientId: 'P-25077', time: '08:15', kind: 'Blood test', label: 'Beta hCG', assigneeId: 'lata-dsouza' },
  ];
  const dueToday: Task[] = [];
  const stimPatients = patients.filter((p) => p.stage === 'stimulation' && !taken.has(p.id) && p.treatmentType === 'IVF_ICSI').slice(0, 6);
  const scanTimes = ['08:45', '09:00', '09:15', '09:40', '10:00'];
  stimPatients.slice(0, 5).forEach((p, i) => {
    const day = daysSince(p.stageEnteredOn) + 1;
    schedule.push({ id: `S-${String(schedule.length + 1).padStart(2, '0')}`, patientId: p.id, time: scanTimes[i]!, kind: 'Scan', label: `Follicle-tracking scan (day ${day})`, assigneeId: 'lata-dsouza' });
    dueToday.push(task(p, `Follicle-tracking scan — stimulation day ${day}`, 'Nurse', 'lata-dsouza', scanTimes[i]!, 'clinical', 'R-05'));
  });
  const trig = stimPatients[5]!;
  setStimDay(trig, 11, 'Day-11 scan: 9 follicles ≥ 17 mm. E2 2,140 pg/mL. Trigger tonight.');
  dueToday.push(task(trig, 'Trigger instructions call: hCG tonight at 21:30', 'Nurse', 'lata-dsouza', '17:00', 'clinical'));

  const opuToday = patients.filter((p) => p.stage === 'opu_embryology' && !taken.has(p.id) && !p.cryo.length).slice(0, 2);
  opuToday.forEach((p, i) => {
    p.stageEnteredOn = DEMO_TODAY;
    p.journey[p.journey.length - 1]!.on = DEMO_TODAY;
    const c = p.cycles[0];
    if (c) { c.opuOn = DEMO_TODAY; c.note = 'OPU today.'; delete c.oocytes; delete c.mii; delete c.fertilised2PN; }
    schedule.push({ id: `S-${String(schedule.length + 1).padStart(2, '0')}`, patientId: p.id, time: i === 0 ? '09:00' : '10:30', kind: 'Procedure', label: 'Oocyte pick-up', assigneeId: 'farhan-qureshi' });
  });
  dueToday.push(task(opuToday[1]!, 'Pre-OPU consent and anaesthesia check', 'Nurse', 'lata-dsouza', '10:00', 'clinical'));

  const etToday = patients.filter((p) => p.stage === 'transfer_luteal' && !taken.has(p.id)).slice(0, 2);
  etToday.forEach((p, i) => {
    p.stageEnteredOn = DEMO_TODAY;
    p.journey[p.journey.length - 1]!.on = DEMO_TODAY;
    schedule.push({ id: `S-${String(schedule.length + 1).padStart(2, '0')}`, patientId: p.id, time: i === 0 ? '11:30' : '13:00', kind: 'Procedure', label: 'Frozen embryo transfer', assigneeId: 'farhan-qureshi' });
  });
  dueToday.push(task(etToday[0]!, 'Transfer consent and progesterone check', 'Nurse', 'lata-dsouza', '11:00', 'clinical'));

  const enq = patients.filter((p) => p.stage === 'enquiry' && !taken.has(p.id) && !p.isOverdue).slice(0, 2);
  enq.forEach((p) => dueToday.push(task(p, 'Confirm first consult booked for tomorrow', 'Navigator', 'sneha-pawar', '12:00', 'admin')));
  const fc = patients.find((p) => p.stage === 'first_consult' && !taken.has(p.id) && !p.isOverdue)!;
  dueToday.push(task(fc, 'Send work-up checklist and lab timings', 'Navigator', 'imran-sayyed', '13:00', 'admin'));
  const plan = patients.find((p) => p.stage === 'plan_counselling' && !taken.has(p.id) && !p.isOverdue && p.treatmentType === 'IVF_ICSI' && p.risk.score < 70)!;
  dueToday.push(task(plan, 'Collect package payment before stimulation start', 'Front desk', 'deepa-shetty', '16:00', 'admin'));

  for (const t of dueToday) patients.find((p) => p.id === t.patientId)!.tasks.push(t);

  // Needs your decision (Dr. Mehta): 3 plan approvals, 2 FET timing decisions
  const planApprovals = patients.filter((p) => p.stage === 'plan_counselling' && !p.isOverdue && !taken.has(p.id) && p.id !== plan.id).slice(0, 3);
  planApprovals.forEach((p) => {
    p.consultantId = 'anil-mehta';
    p.tasks.push(task(p, `Approve treatment plan: ${p.treatmentType === 'IUI' ? 'IUI' : p.treatmentType === 'DONOR_OOCYTE' ? 'donor oocyte IVF' : 'antagonist ICSI'}`, 'Doctor', 'anil-mehta', undefined, 'plan_approval', undefined, '2026-10-13'));
  });
  const fetDecisions = patients.filter((p) => p.stage === 'awaiting_transfer' && !p.isOverdue && !taken.has(p.id) && p.cryo[0]?.disposition === 'Planned FET').slice(0, 2);
  fetDecisions.forEach((p) => {
    p.consultantId = 'anil-mehta';
    p.tasks.push(task(p, 'Decide FET timing: natural or HRT cycle', 'Doctor', 'anil-mehta', undefined, 'fet_timing', undefined, '2026-10-14'));
  });

  // A few upcoming tasks for other roles, so team load reads true
  const counsel = patients.filter((p) => p.wellbeing?.band === 'High distress' || p.wellbeing?.band === 'Moderate').slice(0, 3);
  counsel.forEach((p, i) => p.tasks.push(task(p, 'Counselling follow-up session', 'Counsellor', 'ritu-malhotra', undefined, 'admin', undefined, addDays(DEMO_TODAY, i + 1))));
  const emb = patients.filter((p) => p.stage === 'opu_embryology' && !opuToday.includes(p)).slice(0, 4);
  emb.forEach((p) => p.tasks.push(task(p, 'Day-5 embryology update and vitrification', 'Embryologist', 'farhan-qureshi', undefined, 'clinical', undefined, addDays(p.stageEnteredOn, 5) > DEMO_TODAY ? addDays(p.stageEnteredOn, 5) : addDays(DEMO_TODAY, 1))));
  const viab = patients.filter((p) => p.stage === 'early_pregnancy' && !taken.has(p.id) && (p.gestationWeeks ?? 0) <= 5).slice(0, 3);
  viab.forEach((p) => p.tasks.push(task(p, 'Book viability scan at 6–7 weeks', 'Nurse', 'lata-dsouza', undefined, 'clinical', 'R-08', addDays(DEMO_TODAY, 2))));

  return { appointments, schedule };
}

function setStimDay(p: Patient, day: number, note: string) {
  const start = addDays(DEMO_TODAY, -(day - 1));
  p.stageEnteredOn = start;
  p.journey[p.journey.length - 1]!.on = start;
  const c = p.cycles[0];
  if (c) {
    c.startOn = start;
    c.stimDays = day;
    c.note = note;
  }
}

let taskSeq = 0;
function task(p: Patient, title: string, ownerRole: Task['ownerRole'], assigneeId: string, dueTime: string | undefined, kind: Task['kind'], ruleId?: string, dueOn: string = DEMO_TODAY): Task {
  taskSeq++;
  return { id: `T-G${String(taskSeq).padStart(3, '0')}`, patientId: p.id, title, ownerRole, assigneeId, dueOn, dueTime, priority: 'Normal', status: 'Open', source: ruleId ? 'Rule' : 'Manual', ruleId, kind };
}

export const VALUE_TARGET = 14_190_000;

/** Tune estimated values of early-funnel overdue patients so value at risk lands on target. */
export function tuneValue(patients: Patient[], currentTotal: number) {
  let diff = VALUE_TARGET - currentTotal;
  const adjustable = patients.filter((p) => p.isOverdue && ['enquiry', 'first_consult', 'workup', 'plan_counselling'].includes(p.stage) && (p.treatmentType === 'IVF_ICSI' || p.treatmentType === 'DONOR_OOCYTE') && !p.id.startsWith('P-24390'));
  let i = 0;
  let guard = 0;
  while (Math.abs(diff) >= 5000 && guard++ < 5000) {
    const p = adjustable[i % adjustable.length]!;
    const step = diff > 0 ? 5000 : -5000;
    const next = p.estimatedValueINR + step;
    const [lo, hi] = p.treatmentType === 'DONOR_OOCYTE' ? [320_000, 420_000] : [190_000, 320_000];
    if (next >= lo && next <= hi) {
      p.estimatedValueINR = next;
      diff -= step;
    }
    i++;
  }
}
