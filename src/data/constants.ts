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
