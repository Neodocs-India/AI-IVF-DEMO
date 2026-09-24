// Data model — CLAUDE.md §5. Dates are IST wall-clock strings:
// 'YYYY-MM-DD' for dates and 'YYYY-MM-DDTHH:mm' for times (no timezone suffix).

export type StageId =
  | 'enquiry'
  | 'first_consult'
  | 'workup'
  | 'plan_counselling'
  | 'stimulation'
  | 'opu_embryology'
  | 'awaiting_transfer'
  | 'transfer_luteal'
  | 'beta_awaited'
  | 'early_pregnancy'
  | 'review_after_negative'
  | 'paused_by_choice'
  | 'obstetric_handover'
  | 'delivered'
  | 'exited';

export type TreatmentType = 'IVF_ICSI' | 'FET' | 'IUI' | 'OI' | 'FERTILITY_PRESERVATION' | 'DONOR_OOCYTE';

export type Language = 'English' | 'Marathi' | 'Hindi' | 'Gujarati';
export type Channel = 'WhatsApp' | 'SMS' | 'Call';
export type SourceSystem = 'EMR' | 'IVF software' | 'Lab' | 'Billing' | 'WhatsApp' | 'Anvaya' | 'Cryo register';

export interface Patient {
  id: string;
  name: string;
  age: number;
  partner?: { name: string; age: number };
  locality: string;
  distanceKm: number;
  language: Language;
  phoneMasked: string;
  referralSource: 'Self' | 'Gynaecologist referral' | 'Google' | 'Instagram' | 'Corporate tie-up' | 'Past patient';
  referrerName?: string;
  consultantId: string;
  navigatorId: string;
  treatmentType: TreatmentType;
  stage: StageId;
  stageEnteredOn: string;
  nextExpectedEvent: { label: string; dueOn: string };
  isOverdue: boolean;
  overdueDays?: number;
  overdueRuleId?: string;
  risk: RiskAssessment;
  estimatedValueINR: number;
  clinical: ClinicalSnapshot;
  cycles: Cycle[];
  cryo: CryoItem[];
  timeline: TimelineEvent[];
  messages: Message[];
  tasks: Task[];
  financial: { package: string; paidINR: number; dueINR: number; emi?: boolean; note?: string };
  wellbeing?: { lastScreenOn?: string; score?: number; band?: 'Low' | 'Moderate' | 'High distress' };
  pausedUntil?: string;

  // Demo extensions (not in the original model, needed by the screens)
  preferredChannel: Channel;
  lastContactOn?: string;
  /** Dates this patient first entered each stage (drives the personal journey rail). */
  journey: { stage: StageId; on: string }[];
  /** Booked appointment, if any. */
  nextAppointment?: { on: string; time: string; withId: string; type: string };
  /** Staff-only note shown in the message thread (never in the patient's phone). */
  staffNote?: string;
  snoozedUntil?: string;
  gestationWeeks?: number;
}

export interface ClinicalSnapshot {
  amh?: number;
  afc?: number;
  bmi?: number;
  tsh?: number;
  vitD?: number;
  diagnosis: string[];
  semen?: { concentration: number; progressiveMotility: number; morphology: number };
  infertilityYears: number;
  type: 'Primary' | 'Secondary';
  labDate?: string;
}

export interface Blastocyst {
  day: 5 | 6;
  grade: string;
  fate: 'Transferred' | 'Vitrified' | 'Discarded';
}

export interface Cycle {
  id: string;
  number: number;
  type: TreatmentType;
  protocol: string;
  startOn: string;
  stimDays?: number;
  gonadotropins?: string;
  triggerOn?: string;
  opuOn?: string;
  oocytes?: number;
  mii?: number;
  fertilised2PN?: number;
  blastocysts?: Blastocyst[];
  transferOn?: string;
  endometriumMm?: number;
  betaOn?: string;
  betaValue?: number | '<2';
  outcome: 'Ongoing' | 'Negative' | 'Biochemical' | 'Clinical pregnancy' | 'Miscarriage' | 'Cancelled';
  note?: string;
}

export interface CryoItem {
  id: string;
  kind: 'Embryo' | 'Oocytes' | 'Sperm';
  count: number;
  grade?: string;
  dayFrozen?: 5 | 6;
  frozenOn: string;
  tank: string;
  canister: string;
  cane: string;
  storageRenewalDue: string;
  consentValidUntil: string;
  feeStatus: 'Paid' | 'Due' | 'Overdue';
  lastContactOn: string;
  contactAttempts: number;
  disposition: 'Continue storage' | 'Planned FET' | 'Pending decision' | 'Unreachable protocol';
  /** Contact attempts log (used by the unreachable protocol). */
  attemptsLog?: { on: string; channel: 'Call' | 'WhatsApp' | 'Registered letter' | 'SMS'; outcome: string }[];
}

export interface RiskAssessment {
  score: number;
  band: 'Low' | 'Moderate' | 'High';
  factors: { label: string; weight: number }[];
  suggestedActions: string[];
  trend: 'Rising' | 'Stable' | 'Falling';
}

export type OwnerRole = 'Navigator' | 'Nurse' | 'Doctor' | 'Counsellor' | 'Embryologist' | 'Front desk';

export interface Task {
  id: string;
  patientId: string;
  title: string;
  ownerRole: OwnerRole;
  assigneeId?: string;
  dueOn: string;
  dueTime?: string;
  priority: 'Critical' | 'High' | 'Normal';
  status: 'Open' | 'Done' | 'Snoozed';
  source: 'Rule' | 'Manual' | 'AI suggestion' | 'Patient message';
  ruleId?: string;
  kind?: 'follow_up' | 'plan_approval' | 'fet_timing' | 'clinical' | 'admin';
  note?: string;
  doneAt?: string;
}

export interface Message {
  id: string;
  channel: Channel;
  direction: 'Outbound' | 'Inbound';
  sentBy: 'Automated' | string;
  at: string;
  textOriginal: string;
  textEnglish?: string;
  status: 'Delivered' | 'Read' | 'Unanswered' | 'Replied';
  highlight?: boolean;
}

export interface TimelineEvent {
  at: string;
  type: 'Consult' | 'Investigation' | 'Scan' | 'Procedure' | 'Lab' | 'Message' | 'Call' | 'Payment' | 'Note' | 'Alert';
  title: string;
  detail?: string;
  source: 'EMR' | 'IVF software' | 'Lab' | 'Billing' | 'WhatsApp' | 'Anvaya';
}

export interface FollowUpRule {
  id: string;
  name: string;
  stage: StageId;
  condition: string;
  thresholdDays: number;
  thresholdLabel: string;
  ownerRole: OwnerRole;
  escalateAfterDays: number;
  escalateTo: OwnerRole;
  sensitive: boolean;
  enabled: boolean;
  firedLast30Days: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  time: string; // 'HH:mm'
  visitType: string;
  brief: string;
  status: 'Booked' | 'Checked in' | 'Completed';
}

export interface ScheduleItem {
  id: string;
  patientId: string;
  time: string;
  kind: 'Scan' | 'Procedure' | 'Blood test';
  label: string;
  assigneeId: string;
}
