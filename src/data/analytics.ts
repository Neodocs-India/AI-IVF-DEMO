// Twelve-month clinic analytics (Oct 2025 – Sep 2026) — CLAUDE.md §7.
// Monthly rows are split deterministically so every total matches the targets exactly.

export const MONTHS = ['2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09'];

/** Largest-remainder split of a total across weights. */
function split(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / sum) * total);
  const out = raw.map(Math.floor);
  let rem = total - out.reduce((a, b) => a + b, 0);
  const order = raw.map((r, i) => [r - Math.floor(r), i] as const).sort((a, b) => b[0] - a[0]);
  for (const [, i] of order) {
    if (rem-- <= 0) break;
    out[i]!++;
  }
  return out;
}

const ENQUIRIES = [168, 172, 165, 181, 176, 184, 179, 188, 183, 190, 178, 176];
const wave = (k: number) => ENQUIRIES.map((e, i) => e * (1 + 0.04 * Math.sin(i * 0.9 + k)));

const STEPS = [
  { key: 'enquiries', label: 'Enquiries', total: 2140 },
  { key: 'consults', label: 'First consults', total: 1284 },
  { key: 'workup', label: 'Work-up complete', total: 968 },
  { key: 'started', label: 'Treatment started', total: 612 },
  { key: 'opu', label: 'OPU', total: 498 },
  { key: 'transfer', label: 'Embryo transfer', total: 441 },
  { key: 'pregnancy', label: 'Clinical pregnancy', total: 214 },
  { key: 'ongoing', label: 'Ongoing pregnancy / live birth', total: 172 },
] as const;

const monthly: Record<string, number[]> = Object.fromEntries(
  STEPS.map((s, k) => [s.key, k === 0 ? ENQUIRIES : split(s.total, wave(k))]),
);

const TIME_TO_TREATMENT = [52, 51, 50, 49, 48, 48, 47, 46, 45, 44, 44, 40];

export const ANALYTICS = {
  steps: STEPS,
  monthly,
  funnelTotals: () => STEPS.map((s) => ({ key: s.key, label: s.label, value: monthly[s.key]!.reduce((a, b) => a + b, 0) })),
  leakage: () => {
    const t = STEPS.map((s) => monthly[s.key]!.reduce((a, b) => a + b, 0));
    return [
      { stage: 'Enquiry → first consult', lost: t[0]! - t[1]! },
      { stage: 'First consult → work-up', lost: t[1]! - t[2]! },
      { stage: 'Work-up → treatment start', lost: t[2]! - t[3]! },
      { stage: 'Treatment start → OPU', lost: t[3]! - t[4]! },
      { stage: 'OPU → embryo transfer', lost: t[4]! - t[5]! },
    ];
  },
  dropoutReasons: [
    { reason: 'Cost', count: 68 },
    { reason: 'Emotional fatigue', count: 44 },
    { reason: 'Unknown / lost contact', count: 32 },
    { reason: 'Relocation', count: 22 },
    { reason: 'Moved to another clinic', count: 18 },
    { reason: 'Medical advice to stop', count: 16 },
  ],
  timeToTreatment: MONTHS.map((m, i) => ({ month: m, days: TIME_TO_TREATMENT[i]! })),
  timeToTreatmentTarget: 30,
  avgTimeToTreatment: () => TIME_TO_TREATMENT.reduce((a, b) => a + b, 0) / TIME_TO_TREATMENT.length,
  cprPerTransfer: () => (214 / 441) * 100,
  fet: { freezeAllPatients: 133, fetWithin6Months: 81 },
  fetConversion: () => (81 / 133) * 100,
  cumulative: { patientsStarted: 612, withClinicalPregnancy: 198 },
  navigatorRecovered: [
    { month: '2026-07', sneha: 10, imran: 7 },
    { month: '2026-08', sneha: 11, imran: 8 },
    { month: '2026-09', sneha: 13, imran: 9 },
  ],
  recoveredThisQuarter: () => ANALYTICS.navigatorRecovered.reduce((s, r) => s + r.sneha + r.imran, 0),
  medianResponseHours: { sneha: 2.8, imran: 3.6 },
  centres: [
    { centre: 'Andheri West', enquiries: 2140, consults: 1284, started: 612, transfers: 441, pregnancies: 214, timeToTreatment: 47 },
    { centre: 'Vashi', enquiries: 1120, consults: 702, started: 305, transfers: 214, pregnancies: 98, timeToTreatment: 53 },
  ],
  referral: [
    { source: 'Gynaecologist referral', enquiries: 578, consults: 418, started: 214 },
    { source: 'Google', enquiries: 514, consults: 276, started: 118 },
    { source: 'Self', enquiries: 385, consults: 212, started: 96 },
    { source: 'Instagram', enquiries: 278, consults: 118, started: 42 },
    { source: 'Past patient', enquiries: 235, consults: 174, started: 104 },
    { source: 'Corporate tie-up', enquiries: 150, consults: 86, started: 38 },
  ],
};
