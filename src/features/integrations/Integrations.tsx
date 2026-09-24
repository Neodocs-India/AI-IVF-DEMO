import { BellRing, ClipboardList, FileSpreadsheet, FlaskConical, LayoutDashboard, MessageCircle, MonitorSmartphone, Phone, Receipt, ScanLine, ShieldCheck, Stethoscope, Microscope, FileBarChart, Sparkles } from 'lucide-react';
import { Panel } from '@/components/Panel';
import { formatNum } from '@/lib/format';

const SOURCES = [
  { name: 'IVF lab software', detail: 'Cycles, embryology, cryo register', icon: Microscope, records: 1284, mode: 'Read-only' },
  { name: 'EMR', detail: 'Consult notes, diagnoses, plans', icon: Stethoscope, records: 2316, mode: 'Read-only' },
  { name: 'Lab / LIS', detail: 'Hormones, beta hCG, semen analysis', icon: FlaskConical, records: 948, mode: 'Read-only' },
  { name: 'Ultrasound reporting', detail: 'Follicle tracking, AFC, pregnancy scans', icon: ScanLine, records: 212, mode: 'Read-only' },
  { name: 'Billing', detail: 'Packages, payments, EMI', icon: Receipt, records: 386, mode: 'Read-only' },
  { name: 'Telephony', detail: 'Call logs and outcomes', icon: Phone, records: 174, mode: 'Read-only' },
  { name: 'WhatsApp Business', detail: 'Patient messages and replies', icon: MessageCircle, records: 529, mode: 'Read and send' },
];

const OUTPUTS = [
  { name: 'Dashboards', detail: 'Command Centre, cryo register, analytics', icon: LayoutDashboard },
  { name: 'Tasks and worklists', detail: 'For navigators, nurses, doctors, counsellors', icon: ClipboardList },
  { name: 'Patient messages', detail: 'Reminders and updates in the patient’s language', icon: MonitorSmartphone },
  { name: 'Reports', detail: 'Monthly clinic and centre reports', icon: FileBarChart },
];

const ROW = 62;
const GAP = 10;
const H = SOURCES.length * ROW + (SOURCES.length - 1) * GAP;
const OUT_GAP = (H - OUTPUTS.length * ROW) / (OUTPUTS.length - 1);

export default function Integrations() {
  return (
    <div>
      <header className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Integrations</h1>
        <p className="mt-1 text-sm text-slate">Anvaya works on top of the clinic’s existing systems. It reads from them, it does not replace them.</p>
      </header>

      <section className="mb-6 overflow-x-auto rounded border border-line bg-paper px-6 py-6" data-tour="integrations">
        <div className="grid min-w-[1000px] grid-cols-[1.3fr_64px_230px_64px_0.8fr] items-start">
          <div>
            <h2 className="mb-3 text-xs text-slate">Clinic systems today</h2>
            <ul className="space-y-[10px]">
              {SOURCES.map((s) => (
                <li key={s.name} className="flex items-center gap-3 rounded border border-line px-3" style={{ height: ROW }}>
                  <s.icon className="h-4 w-4 shrink-0 text-slate" />
                  <div className="min-w-0 flex-1 leading-tight">
                    <div className="text-sm font-medium text-ink">{s.name}</div>
                    <div className="truncate text-xs text-slate">{s.detail}</div>
                  </div>
                  <div className="shrink-0 text-right text-[11px] leading-4">
                    <div className="flex items-center justify-end gap-1 text-sage"><span className="h-1.5 w-1.5 rounded-full bg-sage" />Connected · last sync 09:05</div>
                    <div className="num text-slate">{formatNum(s.records)} records today · {s.mode}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Connectors side="in" />
          <div className="mt-7 flex flex-col justify-center rounded border-2 border-lagoon bg-lagoon-50 px-5" style={{ height: H }}>
            <div className="font-serif text-xl text-ink">Anvaya</div>
            <div className="text-xs text-slate">Fertility navigation layer</div>
            <ul className="mt-5 space-y-2.5 text-sm text-ink">
              {['Journey tracking for every patient', 'Follow-up rules and escalation', 'Dropout-risk scoring', 'Pre-consultation summaries', 'Cryo-storage follow-up', 'Patient messaging in 4 languages'].map((c) => (
                <li key={c} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lagoon" />{c}</li>
              ))}
            </ul>
          </div>
          <Connectors side="out" />
          <div>
            <h2 className="mb-3 text-xs text-slate">What the team gets</h2>
            <ul>
              {OUTPUTS.map((o, i) => (
                <li key={o.name} className="flex items-center gap-3 rounded border border-line px-3" style={{ height: ROW, marginTop: i ? OUT_GAP : 0 }}>
                  <o.icon className="h-4 w-4 shrink-0 text-lagoon" />
                  <div className="leading-tight">
                    <div className="text-sm font-medium text-ink">{o.name}</div>
                    <div className="text-xs text-slate">{o.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Panel title="No API? No problem" action={<FileSpreadsheet className="h-4 w-4 text-slate" />}>
          <p className="text-sm text-ink">No API? Scheduled Excel/CSV import supported.</p>
          <p className="mt-1 text-xs text-slate">A nightly export from older software is enough to start.</p>
        </Panel>
        <Panel title="Standards" action={<ShieldCheck className="h-4 w-4 text-slate" />}>
          <p className="text-sm text-ink">Standards: HL7 / FHIR, ABDM-ready.</p>
          <p className="mt-1 text-xs text-slate">Read-only connections by default; every write is logged.</p>
        </Panel>
        <Panel title="Alerts" action={<BellRing className="h-4 w-4 text-slate" />}>
          <p className="text-sm text-ink">Clinical alerts from patient messages go straight to the nurse on duty.</p>
          <p className="mt-1 text-xs text-slate">Sensitive results are never sent to patients automatically.</p>
        </Panel>
        <Panel title="Roadmap" action={<Sparkles className="h-4 w-4 text-slate" />}>
          <p className="text-sm text-ink">Future phase: treatment-outcome modelling, built with the clinic’s own data and clinical review.</p>
          <p className="mt-1 text-xs text-slate">Not part of this demo. Anvaya does not predict pregnancy success today.</p>
        </Panel>
      </div>
    </div>
  );
}

function Connectors({ side }: { side: 'in' | 'out' }) {
  const top = 28; // matches the column heading offset
  const mid = top + H / 2;
  const ys = side === 'in'
    ? SOURCES.map((_, i) => top + i * (ROW + GAP) + ROW / 2)
    : OUTPUTS.map((_, i) => top + i * (ROW + OUT_GAP) + ROW / 2);
  return (
    <svg width="100%" height={H + top} viewBox={`0 0 72 ${H + top}`} preserveAspectRatio="none" aria-hidden>
      {ys.map((y, i) => (
        <path
          key={i}
          d={side === 'in' ? `M 0 ${y} C 40 ${y}, 32 ${mid}, 72 ${mid}` : `M 0 ${mid} C 40 ${mid}, 32 ${y}, 72 ${y}`}
          fill="none"
          stroke="#0D7377"
          strokeOpacity={0.45}
          strokeWidth={1.5}
        />
      ))}
      <circle cx={side === 'in' ? 70 : 2} cy={mid} r={3} fill="#0D7377" />
    </svg>
  );
}
