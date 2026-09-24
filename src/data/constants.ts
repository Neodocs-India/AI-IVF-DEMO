import type { FollowUpRule, OwnerRole, StageId, TreatmentType } from './types';

// Fixed demo clock — CLAUDE.md §1. Never use the system clock for "today".
// Monday, 12 October 2026, 09:10 IST (UTC+05:30).
export const DEMO_NOW = new Date('2026-10-12T09:10:00+05:30');

export const CLINIC = {
  id: 'andheri',
  name: 'Aarambh Fertility Centre',
  area: 'Andheri West, Mumbai',
} as const;

export const SECOND_CENTRE = {
  id: 'vashi',
  name: 'Aarambh Fertility Centre',
  area: 'Vashi',
} as const;

export type StaffRole =
  | 'Medical Director'
  | 'IVF Consultant'
  | 'Fertility Navigator'
  | 'Senior IVF Nurse'
  | 'Chief Embryologist'
  | 'Counsellor'
  | 'Front desk & billing';

export interface Staff {
  id: string;
  name: string;
  shortName: string;
  role: StaffRole;
  title: string;
  /** Avatar circle colour — token name */
  tone: 'lagoon' | 'saffron' | 'sage' | 'rose' | 'slate' | 'ink';
}

export const STAFF: Staff[] = [
  { id: 'anil-mehta', name: 'Dr. Anil Mehta', shortName: 'Dr. Mehta', role: 'Medical Director', title: 'Medical Director & Senior IVF Consultant', tone: 'lagoon' },
  { id: 'shruti-kulkarni', name: 'Dr. Shruti Kulkarni', shortName: 'Dr. Kulkarni', role: 'IVF Consultant', title: 'IVF Consultant', tone: 'sage' },
  { id: 'sneha-pawar', name: 'Sneha Pawar', shortName: 'Sneha', role: 'Fertility Navigator', title: 'Fertility Navigator', tone: 'saffron' },
  { id: 'imran-sayyed', name: 'Imran Sayyed', shortName: 'Imran', role: 'Fertility Navigator', title: 'Fertility Navigator', tone: 'slate' },
  { id: 'lata-dsouza', name: "Lata D'Souza", shortName: 'Lata', role: 'Senior IVF Nurse', title: 'Senior IVF Nurse / Cycle Coordinator', tone: 'rose' },
  { id: 'farhan-qureshi', name: 'Dr. Farhan Qureshi', shortName: 'Dr. Qureshi', role: 'Chief Embryologist', title: 'Chief Embryologist', tone: 'ink' },
  { id: 'ritu-malhotra', name: 'Ritu Malhotra', shortName: 'Ritu', role: 'Counsellor', title: 'Counsellor (psychological & financial)', tone: 'sage' },
  { id: 'deepa-shetty', name: 'Deepa Shetty', shortName: 'Deepa', role: 'Front desk & billing', title: 'Front desk & billing', tone: 'slate' },
];

export const staffById = (id: string): Staff => {
  const s = STAFF.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown staff id: ${id}`);
  return s;
};

// ---------------------------------------------------------------------------
// Dates. Data uses IST wall-clock strings, so "today" is a plain date string.
export const DEMO_TODAY = '2026-10-12';
export const DEMO_TIME = '09:10';

// ---------------------------------------------------------------------------
// Stages — CLAUDE.md §5

export interface StageDef {
  id: StageId;
  label: string;
  shortLabel: string;
  order: number;
  expectedDurationDays: number;
  owner: OwnerRole;
  description: string;
  active: boolean;
  side?: boolean;
  /** Plain-language label for the patient app */
  patientLabel: string;
}

export const STAGES: StageDef[] = [
  { id: 'enquiry', label: 'Enquiry', shortLabel: 'Enquiry', order: 1, expectedDurationDays: 7, owner: 'Navigator', description: 'Called, messaged or walked in; first consult not yet held.', active: true, patientLabel: 'First contact' },
  { id: 'first_consult', label: 'First consult', shortLabel: 'First consult', order: 2, expectedDurationDays: 14, owner: 'Doctor', description: 'Seen by a consultant; investigations advised.', active: true, patientLabel: 'Meeting your doctor' },
  { id: 'workup', label: 'Work-up', shortLabel: 'Work-up', order: 3, expectedDurationDays: 10, owner: 'Nurse', description: 'Hormone profile, AMH, AFC scan, semen analysis, infection screen.', active: true, patientLabel: 'Tests' },
  { id: 'plan_counselling', label: 'Plan & counselling', shortLabel: 'Plan', order: 4, expectedDurationDays: 30, owner: 'Doctor', description: 'Treatment plan, consent, costing and counselling.', active: true, patientLabel: 'Your treatment plan' },
  { id: 'stimulation', label: 'Stimulation', shortLabel: 'Stimulation', order: 5, expectedDurationDays: 12, owner: 'Nurse', description: 'Ovarian stimulation with follicle-tracking scans and E2.', active: true, patientLabel: 'Injections and scans' },
  { id: 'opu_embryology', label: 'OPU & embryology', shortLabel: 'OPU', order: 6, expectedDurationDays: 6, owner: 'Embryologist', description: 'Oocyte pick-up, ICSI and embryo culture to blastocyst.', active: true, patientLabel: 'Egg collection' },
  { id: 'awaiting_transfer', label: 'Awaiting transfer', shortLabel: 'Awaiting ET', order: 7, expectedDurationDays: 60, owner: 'Doctor', description: 'Embryos vitrified; frozen embryo transfer not yet done.', active: true, patientLabel: 'Embryos stored' },
  { id: 'transfer_luteal', label: 'Transfer & luteal support', shortLabel: 'Transfer', order: 8, expectedDurationDays: 3, owner: 'Nurse', description: 'Embryo transfer done; progesterone support.', active: true, patientLabel: 'Embryo transfer' },
  { id: 'beta_awaited', label: 'Beta awaited', shortLabel: 'Beta', order: 9, expectedDurationDays: 11, owner: 'Nurse', description: 'Waiting for the beta hCG blood test.', active: true, patientLabel: 'Pregnancy test' },
  { id: 'early_pregnancy', label: 'Early pregnancy', shortLabel: 'Early preg.', order: 10, expectedDurationDays: 60, owner: 'Doctor', description: 'Positive beta; viability and dating scans to 12 weeks.', active: true, patientLabel: 'Early pregnancy' },
  { id: 'review_after_negative', label: 'Review after negative result', shortLabel: 'Review (neg.)', order: 11, expectedDurationDays: 21, owner: 'Navigator', description: 'Negative beta; review consult due.', active: true, side: true, patientLabel: 'Review with your doctor' },
  { id: 'paused_by_choice', label: 'Paused by choice', shortLabel: 'Paused', order: 12, expectedDurationDays: 90, owner: 'Navigator', description: 'Patient has chosen to pause treatment.', active: true, side: true, patientLabel: 'Taking a break' },
  { id: 'obstetric_handover', label: 'Obstetric handover', shortLabel: 'Handover', order: 13, expectedDurationDays: 200, owner: 'Doctor', description: 'Handed over to obstetric care.', active: false, patientLabel: 'Your obstetrician' },
  { id: 'delivered', label: 'Delivered', shortLabel: 'Delivered', order: 14, expectedDurationDays: 0, owner: 'Navigator', description: 'Baby delivered.', active: false, patientLabel: 'Your baby' },
  { id: 'exited', label: 'Exited', shortLabel: 'Exited', order: 15, expectedDurationDays: 0, owner: 'Navigator', description: 'Left treatment at this clinic.', active: false, side: true, patientLabel: 'Closed' },
];

export const stageById = (id: StageId) => STAGES.find((s) => s.id === id)!;
export const ACTIVE_STAGES = STAGES.filter((s) => s.active);
/** The main linear path, in order (for journey rails). */
export const MAIN_PATH: StageId[] = [
  'enquiry', 'first_consult', 'workup', 'plan_counselling', 'stimulation', 'opu_embryology',
  'awaiting_transfer', 'transfer_luteal', 'beta_awaited', 'early_pregnancy', 'obstetric_handover', 'delivered',
];

export const TREATMENT_LABEL: Record<TreatmentType, string> = {
  IVF_ICSI: 'IVF-ICSI',
  FET: 'Frozen embryo transfer',
  IUI: 'IUI',
  OI: 'Ovulation induction',
  FERTILITY_PRESERVATION: 'Fertility preservation',
  DONOR_OOCYTE: 'Donor oocyte IVF',
};

// ---------------------------------------------------------------------------
// Follow-up rules — CLAUDE.md §8.9
export const RULES: FollowUpRule[] = [
  { id: 'R-01', name: 'Enquiry with no first consult booked', stage: 'enquiry', condition: 'no first consult booked', thresholdDays: 7, thresholdLabel: '7 days', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Front desk', sensitive: false, enabled: true, firedLast30Days: 41 },
  { id: 'R-02', name: 'First consult done, no work-up booked', stage: 'first_consult', condition: 'no work-up booked', thresholdDays: 14, thresholdLabel: '14 days', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 26 },
  { id: 'R-03', name: 'Work-up complete, no plan discussion', stage: 'workup', condition: 'no plan discussion booked', thresholdDays: 10, thresholdLabel: '10 days', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 18 },
  { id: 'R-04', name: 'Plan given, no treatment start', stage: 'plan_counselling', condition: 'no treatment start date', thresholdDays: 30, thresholdLabel: '30 days', ownerRole: 'Navigator', escalateAfterDays: 14, escalateTo: 'Counsellor', sensitive: false, enabled: true, firedLast30Days: 12 },
  { id: 'R-05', name: 'Stimulation monitoring visit missed', stage: 'stimulation', condition: 'not checked in for a monitoring scan', thresholdDays: 0, thresholdLabel: 'Same day, 60 min', ownerRole: 'Nurse', escalateAfterDays: 0, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 5 },
  { id: 'R-06', name: 'Beta hCG result not communicated', stage: 'beta_awaited', condition: 'result not communicated to the patient', thresholdDays: 1, thresholdLabel: '1 day', ownerRole: 'Doctor', escalateAfterDays: 1, escalateTo: 'Doctor', sensitive: true, enabled: true, firedLast30Days: 3 },
  { id: 'R-07', name: 'Negative result, no review consult', stage: 'review_after_negative', condition: 'no review consult booked', thresholdDays: 21, thresholdLabel: '21 days', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Doctor', sensitive: true, enabled: true, firedLast30Days: 9 },
  { id: 'R-08', name: 'Positive beta, no viability scan booked', stage: 'early_pregnancy', condition: 'no viability scan booked', thresholdDays: 7, thresholdLabel: '7 days', ownerRole: 'Nurse', escalateAfterDays: 3, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 2 },
  { id: 'R-09', name: 'Pregnancy, obstetric handover not done', stage: 'early_pregnancy', condition: 'obstetric handover not done', thresholdDays: 84, thresholdLabel: '12 weeks gestation', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 4 },
  { id: 'R-10', name: 'Freeze-all, no FET plan', stage: 'awaiting_transfer', condition: 'no FET plan after a freeze-all cycle', thresholdDays: 90, thresholdLabel: '90 days', ownerRole: 'Navigator', escalateAfterDays: 14, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 6 },
  { id: 'R-11', name: 'Embryos stored, no FET plan', stage: 'awaiting_transfer', condition: 'no FET plan', thresholdDays: 180, thresholdLabel: '180 days', ownerRole: 'Navigator', escalateAfterDays: 30, escalateTo: 'Doctor', sensitive: false, enabled: true, firedLast30Days: 8 },
  { id: 'R-12', name: 'Storage renewal due', stage: 'awaiting_transfer', condition: 'storage renewal due', thresholdDays: 60, thresholdLabel: '60 days before due', ownerRole: 'Front desk', escalateAfterDays: 30, escalateTo: 'Embryologist', sensitive: false, enabled: true, firedLast30Days: 11 },
  { id: 'R-13', name: '≥ 3 failed contact attempts', stage: 'paused_by_choice', condition: 'three or more failed contact attempts', thresholdDays: 0, thresholdLabel: '—', ownerRole: 'Navigator', escalateAfterDays: 7, escalateTo: 'Doctor', sensitive: true, enabled: true, firedLast30Days: 3 },
  { id: 'R-14', name: 'Paused by choice, pause period ended', stage: 'paused_by_choice', condition: 'the agreed pause period has ended', thresholdDays: 0, thresholdLabel: '0 days', ownerRole: 'Navigator', escalateAfterDays: 14, escalateTo: 'Counsellor', sensitive: true, enabled: true, firedLast30Days: 4 },
];

// ---------------------------------------------------------------------------
// KPI targets — CLAUDE.md §7 (asserted by scripts/verify-data.ts)
export const KPI_TARGETS = {
  active: 412,
  overdue: 37,
  highRisk: 23,
  valueAtRiskMin: 14_150_000,
  valueAtRiskMax: 14_249_999,
  dueToday: 14,
  consultsToday: 14,
  consultsMehta: 9,
  consultsKulkarni: 5,
  stageCounts: {
    enquiry: 46, first_consult: 52, workup: 48, plan_counselling: 31, stimulation: 29, opu_embryology: 14,
    awaiting_transfer: 58, transfer_luteal: 21, beta_awaited: 12, early_pregnancy: 34, review_after_negative: 27, paused_by_choice: 40,
  } as Partial<Record<StageId, number>>,
  cryo: {
    patients: 186, embryos: 461, oocytes: 212, oocytePatients: 17, sperm: 38, noFetPlan: 42, renewals60: 11, unreachable: 3,
  },
} as const;

export const PRICES = {
  fetMin: 65_000,
  fetMax: 85_000,
  icsiMin: 180_000,
  icsiMax: 220_000,
};
