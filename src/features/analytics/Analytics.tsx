import { useState } from 'react';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ANALYTICS } from '@/data/analytics';
import { fmtMonthShort } from '@/lib/dates';
import { formatNum } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Panel } from '@/components/Panel';

const PERIODS = ['Last 30 days', 'Last quarter', 'Last 12 months', 'Custom range'];

export default function Analytics() {
  const funnel = ANALYTICS.funnelTotals();
  const leakage = ANALYTICS.leakage();
  const reasons = ANALYTICS.dropoutReasons;
  const reasonTotal = reasons.reduce((s, r) => s + r.count, 0);
  const [hint, setHint] = useState(false);
  const recovered = ANALYTICS.recoveredThisQuarter();

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-slate">Aarambh Fertility Centre, Andheri West · October 2025 to September 2026</p>
        </div>
        <div className="relative">
          <div className="flex rounded border border-line bg-paper p-0.5 text-xs" role="group" aria-label="Period">
            {PERIODS.map((p) => (
              <button key={p} type="button" onClick={() => p !== 'Last 12 months' && setHint(true)} className={cn('rounded px-2.5 py-1.5', p === 'Last 12 months' ? 'bg-ink text-white' : 'text-slate hover:bg-mist')}>{p}</button>
            ))}
          </div>
          {hint && <p className="absolute right-0 top-10 text-xs text-slate">This concept demo has data for the last 12 months only.</p>}
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Funnel */}
        <Panel className="xl:col-span-2" title="From enquiry to ongoing pregnancy" meta="Patients reaching each step in the last 12 months">
          <Takeaway>Of 2,140 enquiries, 612 couples started treatment and 172 have an ongoing pregnancy or live birth. The steepest losses come before treatment starts.</Takeaway>
          <Funnel steps={funnel} />
        </Panel>

        <Panel title="Where patients are lost" meta="Patients who did not reach the next step">
          <Takeaway>Once patients have seen a doctor, 672 are lost before treatment starts: 316 before work-up and 356 after it.</Takeaway>
          <HBars rows={leakage.map((l) => ({ label: l.stage, value: l.lost, display: formatNum(l.lost) }))} tone="attention" />
        </Panel>

        <Panel title="Reasons for dropping out" meta={`Where a reason was recorded · ${reasonTotal} patients`}>
          <Takeaway>Cost is the most common reason given, followed by emotional fatigue. One in six simply lost contact.</Takeaway>
          <HBars rows={reasons.map((r) => ({ label: r.reason, value: r.count, display: `${Math.round((r.count / reasonTotal) * 100)}%`, title: `${r.count} patients` }))} />
        </Panel>

        <Panel title="Time from first consult to treatment start" meta="Average days, by month of treatment start">
          <Takeaway>Patients wait 47 days on average, against a target of 30. The gap is narrowing, from 52 days a year ago to 40 in September.</Takeaway>
          <TimeToTreatment />
        </Panel>

        <Panel title="Outcomes" meta="Last 12 months">
          <Takeaway>Nearly half of all transfers result in a clinical pregnancy; 4 in 10 freeze-all patients have not had an FET within 6 months.</Takeaway>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line">
            <Stat value={`${ANALYTICS.cprPerTransfer().toFixed(1)}%`} label="Clinical pregnancy per transfer" sub="214 of 441 transfers" />
            <Stat value={`${Math.round(ANALYTICS.fetConversion())}%`} label="FET within 6 months of freeze-all" sub={`${ANALYTICS.fet.fetWithin6Months} of ${ANALYTICS.fet.freezeAllPatients} patients`} />
            <Stat value={`${((ANALYTICS.cumulative.withClinicalPregnancy / ANALYTICS.cumulative.patientsStarted) * 100).toFixed(1)}%`} label="Cumulative pregnancy per patient started" sub={`${ANALYTICS.cumulative.withClinicalPregnancy} of ${ANALYTICS.cumulative.patientsStarted} patients`} />
          </div>
          <p className="mt-3 text-xs text-slate">Historical results only. Anvaya does not predict treatment success.</p>
        </Panel>

        <Panel title="Centre comparison" meta="Andheri West and Vashi, last 12 months" bodyClassName="px-0 py-0">
          <div className="px-5 pt-4"><Takeaway>Vashi converts fewer consults to treatment (43% against 48%) and patients wait 6 days longer to start.</Takeaway></div>
          <CentreTable />
        </Panel>

        <Panel title="Referral sources" meta="Enquiries to treatment start" bodyClassName="px-0 py-0">
          <div className="px-5 pt-4"><Takeaway>Gynaecologist referrals bring the most patients into treatment and past patients convert best; only 15% of Instagram enquiries reach treatment.</Takeaway></div>
          <ReferralTable />
        </Panel>

        <Panel className="xl:col-span-2" title="Navigator impact" meta="July to September 2026">
          <Takeaway>Navigators brought {recovered} overdue patients back into care this quarter, and the number rose each month.</Takeaway>
          <NavigatorImpact />
        </Panel>
      </div>
    </div>
  );
}

function Takeaway({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 font-serif text-base leading-6 text-ink">{children}</p>;
}

function Stat({ value, label, sub }: { value: string; label: string; sub?: string }) {
  return (
    <div className="bg-paper px-4 py-3">
      <div className="num text-xl font-semibold text-ink">{value}</div>
      <div className="text-xs leading-4 text-ink">{label}</div>
      {sub && <div className="num mt-0.5 text-xs text-slate">{sub}</div>}
    </div>
  );
}

function Funnel({ steps }: { steps: { key: string; label: string; value: number }[] }) {
  const max = steps[0]!.value;
  const [hover, setHover] = useState<number | null>(null);
  return (
    <div className="space-y-1">
      {steps.map((s, i) => {
        const conv = i > 0 ? (s.value / steps[i - 1]!.value) * 100 : null;
        return (
          <div key={s.key} className="grid grid-cols-[200px_1fr_70px_130px] items-center gap-3 rounded px-1 py-1 text-sm" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <span className="text-ink">{s.label}</span>
            <span className="relative h-6">
              <span className={cn('absolute inset-y-0 left-0 rounded-r-[4px] transition-colors', hover === i ? 'bg-lagoon' : 'bg-lagoon/75')} style={{ width: `${Math.max(1, (s.value / max) * 100)}%` }} />
              {hover === i && (
                <span className="num absolute left-2 top-7 z-10 whitespace-nowrap rounded bg-ink px-2 py-1 text-xs text-white shadow-pop">
                  {s.label}: {formatNum(s.value)} · {((s.value / max) * 100).toFixed(1)}% of enquiries
                </span>
              )}
            </span>
            <span className="num text-right font-semibold text-ink">{formatNum(s.value)}</span>
            <span className="num text-right text-xs text-slate">{conv === null ? '' : `${conv.toFixed(0)}% of previous`}</span>
          </div>
        );
      })}
    </div>
  );
}

function HBars({ rows, tone }: { rows: { label: string; value: number; display: string; title?: string }[]; tone?: 'attention' }) {
  const max = Math.max(...rows.map((r) => r.value));
  return (
    <ul className="space-y-2">
      {rows.map((r) => (
        <li key={r.label} className="group grid grid-cols-[170px_1fr_48px] items-center gap-3 text-sm" title={r.title ?? `${r.label}: ${r.display}`}>
          <span className="text-ink">{r.label}</span>
          <span className="h-4">
            <span className={cn('block h-4 rounded-r-[4px] transition-opacity group-hover:opacity-100', tone === 'attention' ? 'bg-saffron opacity-85' : 'bg-lagoon opacity-75')} style={{ width: `${(r.value / max) * 100}%` }} />
          </span>
          <span className="num text-right font-medium text-ink">{r.display}</span>
        </li>
      ))}
    </ul>
  );
}

function TimeToTreatment() {
  const data = ANALYTICS.timeToTreatment.map((d) => ({ month: fmtMonthShort(d.month + '-01').replace(' 20', " '"), days: d.days }));
  return (
    <div className="h-56">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -12 }}>
          <CartesianGrid vertical={false} stroke="#DCE3E6" strokeDasharray="0" />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#5B6B7C' }} axisLine={{ stroke: '#DCE3E6' }} tickLine={false} interval={1} />
          <YAxis domain={[0, 60]} ticks={[0, 15, 30, 45, 60]} tick={{ fontSize: 11, fill: '#5B6B7C' }} axisLine={false} tickLine={false} />
          <ReferenceLine y={30} stroke="#18263A" strokeDasharray="4 4" label={{ value: 'Target 30 days', position: 'insideBottomRight', fill: '#18263A', fontSize: 11 }} />
          <Tooltip
            cursor={{ stroke: '#5B6B7C', strokeDasharray: '3 3' }}
            contentStyle={{ borderRadius: 6, border: '1px solid #DCE3E6', fontSize: 12 }}
            formatter={(v) => [`${v} days`, 'Average wait']}
          />
          <Line type="monotone" dataKey="days" stroke="#0D7377" strokeWidth={2} dot={{ r: 3, fill: '#0D7377', stroke: '#FFFFFF', strokeWidth: 2 }} activeDot={{ r: 5, stroke: '#FFFFFF', strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function CentreTable() {
  const [a, v] = ANALYTICS.centres;
  const rows: { label: string; a: string; v: string; better: 'a' | 'v' | null }[] = [
    { label: 'Enquiries', a: formatNum(a!.enquiries), v: formatNum(v!.enquiries), better: null },
    { label: 'First consults', a: formatNum(a!.consults), v: formatNum(v!.consults), better: null },
    { label: 'Consult to treatment start', a: `${Math.round((a!.started / a!.consults) * 100)}%`, v: `${Math.round((v!.started / v!.consults) * 100)}%`, better: 'a' },
    { label: 'Days from consult to start', a: `${a!.timeToTreatment}`, v: `${v!.timeToTreatment}`, better: 'a' },
    { label: 'Embryo transfers', a: formatNum(a!.transfers), v: formatNum(v!.transfers), better: null },
    { label: 'Clinical pregnancy per transfer', a: `${((a!.pregnancies / a!.transfers) * 100).toFixed(1)}%`, v: `${((v!.pregnancies / v!.transfers) * 100).toFixed(1)}%`, better: 'a' },
  ];
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-y border-line text-left text-xs text-slate">
          <th className="px-5 py-2 font-normal">Measure</th>
          <th className="px-3 py-2 text-right font-normal">Andheri West</th>
          <th className="px-5 py-2 text-right font-normal">Vashi</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.label} className="border-b border-line last:border-0">
            <td className="px-5 py-2 text-ink">{r.label}</td>
            <td className={cn('num px-3 text-right', r.better === 'a' ? 'font-semibold text-ink' : 'text-ink')}>{r.a}</td>
            <td className={cn('num px-5 text-right', r.better === 'v' ? 'font-semibold' : 'text-slate')}>{r.v}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ReferralTable() {
  const rows = ANALYTICS.referral;
  const maxConv = Math.max(...rows.map((r) => r.started / r.enquiries));
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-y border-line text-left text-xs text-slate">
          <th className="px-5 py-2 font-normal">Source</th>
          <th className="px-2 py-2 text-right font-normal">Enquiries</th>
          <th className="px-2 py-2 text-right font-normal">Consults</th>
          <th className="px-2 py-2 text-right font-normal">Started</th>
          <th className="w-[28%] px-5 py-2 font-normal">Enquiry to start</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const conv = r.started / r.enquiries;
          return (
            <tr key={r.source} className="border-b border-line last:border-0">
              <td className="px-5 py-2 text-ink">{r.source}</td>
              <td className="num px-2 text-right">{formatNum(r.enquiries)}</td>
              <td className="num px-2 text-right">{formatNum(r.consults)}</td>
              <td className="num px-2 text-right">{formatNum(r.started)}</td>
              <td className="px-5">
                <span className="flex items-center gap-2">
                  <span className="h-2 flex-1 rounded-full bg-mist"><span className="block h-2 rounded-full bg-lagoon/75" style={{ width: `${(conv / maxConv) * 100}%` }} /></span>
                  <span className="num w-9 text-right text-xs text-ink">{Math.round(conv * 100)}%</span>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function NavigatorImpact() {
  const r = ANALYTICS.navigatorRecovered;
  const sneha = r.reduce((s, x) => s + x.sneha, 0);
  const imran = r.reduce((s, x) => s + x.imran, 0);
  const max = Math.max(...r.map((x) => x.sneha + x.imran));
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr_1fr]">
      <div>
        <div className="num text-2xl font-semibold text-ink">{sneha + imran}</div>
        <div className="text-sm text-ink">patients recovered from overdue</div>
        <div className="mt-1 text-xs text-slate">Reached, booked and back on track</div>
      </div>
      <div>
        <div className="mb-2 text-xs text-slate">By month</div>
        <ul className="space-y-2">
          {r.map((x) => (
            <li key={x.month} className="grid grid-cols-[72px_1fr_28px] items-center gap-3 text-sm">
              <span className="whitespace-nowrap text-slate">{fmtMonthShort(x.month + '-01')}</span>
              <span className="h-4"><span className="block h-4 rounded-r-[4px] bg-lagoon/75" style={{ width: `${((x.sneha + x.imran) / max) * 100}%` }} /></span>
              <span className="num text-right font-medium">{x.sneha + x.imran}</span>
            </li>
          ))}
        </ul>
      </div>
      <table className="self-start text-sm">
        <thead>
          <tr className="text-left text-xs text-slate">
            <th className="pb-2 pr-6 font-normal">Navigator</th>
            <th className="pb-2 pr-6 text-right font-normal">Recovered</th>
            <th className="pb-2 text-right font-normal">Median first response</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t border-line"><td className="py-2 pr-6">Sneha Pawar</td><td className="num pr-6 text-right">{sneha}</td><td className="num text-right">{ANALYTICS.medianResponseHours.sneha} hours</td></tr>
          <tr className="border-t border-line"><td className="py-2 pr-6">Imran Sayyed</td><td className="num pr-6 text-right">{imran}</td><td className="num text-right">{ANALYTICS.medianResponseHours.imran} hours</td></tr>
        </tbody>
      </table>
    </div>
  );
}
