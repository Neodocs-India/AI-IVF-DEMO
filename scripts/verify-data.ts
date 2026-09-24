// Asserts every KPI target in CLAUDE.md §7. Run with `npm run verify-data`.
import { SEED } from '../src/data/seed';
import { KPI_TARGETS as T, ACTIVE_STAGES } from '../src/data/constants';
import { ANALYTICS } from '../src/data/analytics';
import * as S from '../src/lib/selectors';
import { formatCrore, formatINR } from '../src/lib/format';

const { patients, appointments } = SEED;
let failed = 0;
const row = (label: string, actual: string | number, expected: string | number, ok: boolean) => {
  if (!ok) failed++;
  console.log(`${ok ? '  ok ' : ' FAIL'}  ${label.padEnd(46)} ${String(actual).padStart(14)}   target ${expected}`);
};
const eq = (label: string, actual: number, expected: number) => row(label, actual, expected, actual === expected);

console.log('\nCommand Centre');
eq('Active patients', S.activePatients(patients).length, T.active);
eq('Overdue for follow-up', S.overduePatients(patients).length, T.overdue);
eq('High dropout risk (score ≥ 70)', S.highRiskPatients(patients).length, T.highRisk);
const v = S.valueAtRisk(patients);
row('Treatment value at risk', `${formatINR(v)} (${formatCrore(v)})`, '₹1.42 Cr', v >= T.valueAtRiskMin && v <= T.valueAtRiskMax);
const priya = patients.find((p) => p.id === 'P-24817')!;
row('  …after Priya is reached (−₹85,000)', formatCrore(v - priya.estimatedValueINR), '₹1.41 Cr', formatCrore(v - priya.estimatedValueINR) === '₹1.41 Cr');
eq('Due today (tasks)', S.dueTodayTasks(patients).length, T.dueToday);
eq('Consults today', appointments.length, T.consultsToday);
eq('  Dr. Mehta', appointments.filter((a) => a.doctorId === 'anil-mehta').length, T.consultsMehta);
eq('  Dr. Kulkarni', appointments.filter((a) => a.doctorId === 'shruti-kulkarni').length, T.consultsKulkarni);
eq('Critical alerts', S.criticalTasks(patients).length, 0);

console.log('\nActive patients by stage');
const counts = S.stageCounts(patients);
for (const s of ACTIVE_STAGES) eq(s.label, counts[s.id].total, T.stageCounts[s.id]!);

console.log('\nCryo-Storage Register');
const c = S.cryoMetrics(patients);
eq('Patients with stored material', c.patients, T.cryo.patients);
eq('Embryos in storage', c.embryos, T.cryo.embryos);
eq('Oocytes in storage', c.oocytes, T.cryo.oocytes);
eq('  from patients', c.oocytePatients, T.cryo.oocytePatients);
eq('Sperm samples', c.sperm, T.cryo.sperm);
eq('Embryos, no FET plan > 6 months (patients)', c.noFetPlan, T.cryo.noFetPlan);
eq('Storage renewals due in next 60 days', c.renewals60, T.cryo.renewals60);
eq('Unreachable (≥ 3 failed attempts)', c.unreachable, T.cryo.unreachable);

console.log('\nAnalytics (Oct 2025 – Sep 2026)');
const f = ANALYTICS.funnelTotals();
const F = [['Enquiries', 2140], ['First consults', 1284], ['Work-up complete', 968], ['Treatment started', 612], ['OPU', 498], ['Embryo transfer', 441], ['Clinical pregnancy', 214], ['Ongoing pregnancy / live birth', 172]] as const;
F.forEach(([label, n], i) => eq(label, f[i]!.value, n));
const dr = ANALYTICS.dropoutReasons;
const drTotal = dr.reduce((s, r) => s + r.count, 0);
const drExpect = [34, 22, 16, 11, 9, 8];
dr.forEach((r, i) => eq(`Drop-out: ${r.reason} (%)`, Math.round((r.count / drTotal) * 100), drExpect[i]!));
eq('Avg first consult → treatment (days)', ANALYTICS.avgTimeToTreatment(), 47);
row('Clinical pregnancy per transfer', `${ANALYTICS.cprPerTransfer().toFixed(1)}%`, '48.5%', ANALYTICS.cprPerTransfer().toFixed(1) === '48.5');
eq('FET conversion within 6 months (%)', Math.round(ANALYTICS.fetConversion()), 61);
eq('Recovered from overdue this quarter', ANALYTICS.recoveredThisQuarter(), 58);

console.log('\nHero checks');
row('Priya is first on the overdue list', S.overduePatients(patients)[0]!.name, 'Priya Deshmukh', S.overduePatients(patients)[0]!.id === 'P-24817');
row('Priya risk factors sum to score', priya.risk.factors.reduce((s, x) => s + x.weight, 0), 82, priya.risk.factors.reduce((s, x) => s + x.weight, 0) === 82 && priya.risk.score === 82);
const badRisk = patients.filter((p) => p.risk.factors.reduce((s, x) => s + x.weight, 0) !== p.risk.score);
eq('Patients whose risk weights do not sum to score', badRisk.length, 0);
const badCycle = patients.filter((p) => p.cycles.some((cy) => (cy.oocytes ?? 99) < (cy.mii ?? 0) || (cy.mii ?? 99) < (cy.fertilised2PN ?? 0) || (cy.fertilised2PN ?? 99) < (cy.blastocysts?.length ?? 0)));
eq('Cycles with inconsistent embryology counts', badCycle.length, 0);
const ids = new Set(patients.map((p) => p.id));
eq('Duplicate patient IDs', patients.length - ids.size, 0);

console.log(`\n${failed === 0 ? 'All targets pass.' : `${failed} check(s) failed.`}  (${patients.length} patients in dataset)\n`);
process.exit(failed === 0 ? 0 : 1);
