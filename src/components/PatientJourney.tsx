import type { Patient, StageId } from '@/data/types';
import { stageById } from '@/data/constants';
import { fmtDay, fmtMonthShort } from '@/lib/dates';
import { cn } from '@/lib/utils';

// Personal journey rail (Patient 360). Same visual language as the Command Centre rail:
// a horizontal line with stage nodes. Earlier cycles that returned the patient to
// stimulation are drawn as loops above the rail.

const RAIL: StageId[] = ['enquiry', 'first_consult', 'workup', 'plan_counselling', 'stimulation', 'opu_embryology', 'awaiting_transfer', 'transfer_luteal', 'beta_awaited', 'early_pregnancy', 'obstetric_handover', 'delivered'];
const SIDE: StageId[] = ['review_after_negative', 'paused_by_choice', 'exited'];

export function PatientJourney({ patient }: { patient: Patient }) {
  const W = 1000;
  const pad = 40;
  const step = (W - pad * 2) / (RAIL.length - 1);
  const x = (s: StageId) => pad + RAIL.indexOf(s) * step;

  // First date each rail stage was reached, and the latest
  const firstOn = new Map<StageId, string>();
  const lastOn = new Map<StageId, string>();
  for (const j of patient.journey) {
    if (!firstOn.has(j.stage)) firstOn.set(j.stage, j.on);
    lastOn.set(j.stage, j.on);
  }
  const current = patient.stage;
  const onSide = SIDE.includes(current);

  // Loops: each completed cycle drawn as an arc over the treatment segment it covered
  const loops: { from: StageId; to: StageId; label: string; outcome: string }[] =
    patient.cycles.length >= 2
      ? patient.cycles
          .filter((c) => c.outcome !== 'Ongoing')
          .map((c) => ({
            from: c.type === 'FET' ? 'transfer_luteal' : 'stimulation',
            to: c.transferOn ? 'beta_awaited' : 'opu_embryology',
            label: `${c.type === 'FET' ? 'FET' : 'Cycle'} ${c.number} · ${fmtMonthShort(c.startOn)}`,
            outcome: c.outcome === 'Negative' ? 'beta <2, negative' : c.outcome === 'Cancelled' ? (c.type === 'FERTILITY_PRESERVATION' ? 'oocytes frozen' : 'freeze-all') : c.outcome.toLowerCase(),
          }))
      : [];

  const Y = 44 + loops.length * 30;

  // The furthest rail stage reached
  const reachedIdx = Math.max(...patient.journey.filter((j) => RAIL.includes(j.stage)).map((j) => RAIL.indexOf(j.stage)), 0);
  const currentIdx = onSide ? reachedIdx : RAIL.indexOf(current);
  const sideAnchor = onSide ? RAIL[reachedIdx]! : null;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${W} ${Y + (onSide ? 118 : 72)}`} className="min-w-[860px]" role="img" aria-label={`Journey for ${patient.name}: currently ${stageById(current).label}`}>
        {/* Loops for earlier cycles */}
        {loops.map((l, i) => {
          const x0 = x(l.from);
          const x1 = x(l.to);
          const h = 28 + i * 30;
          const peak = Y - 10 - 0.75 * (h + 4);
          return (
            <g key={i}>
              <path d={`M ${x0} ${Y - 10} C ${x0} ${Y - h - 14}, ${x1} ${Y - h - 14}, ${x1} ${Y - 10}`} fill="none" stroke="#D9971E" strokeWidth={1.5} strokeDasharray={i === loops.length - 1 ? undefined : '4 3'} />
              <text x={(x0 + x1) / 2} y={peak + 4} textAnchor="middle" className="text-[12px]" style={{ paintOrder: 'stroke', stroke: '#FFFFFF', strokeWidth: 5, strokeLinejoin: 'round' }}>
                <tspan className="fill-ink">{l.label}</tspan> <tspan className="fill-slate">· {l.outcome}</tspan>
              </text>
            </g>
          );
        })}

        {/* Rail */}
        <line x1={pad} x2={W - pad} y1={Y} y2={Y} stroke="#DCE3E6" strokeWidth={2} />
        <line x1={pad} x2={x(RAIL[currentIdx]!)} y1={Y} y2={Y} stroke="#0D7377" strokeWidth={3} />

        {RAIL.map((s, i) => {
          const done = i < currentIdx || (onSide && i <= currentIdx);
          const here = !onSide && i === currentIdx;
          const skipped = done && !firstOn.has(s);
          const date = lastOn.get(s);
          return (
            <g key={s}>
              {here && <circle cx={x(s)} cy={Y} r={15} fill="#0D7377" opacity={0.15} />}
              <circle cx={x(s)} cy={Y} r={here ? 9 : 6} fill={skipped ? '#FFFFFF' : done || here ? '#0D7377' : '#FFFFFF'} stroke={done || here ? '#0D7377' : '#C5D0D5'} strokeWidth={2} />
              <text x={x(s)} y={Y + 26} textAnchor="middle" className={cn('text-[12px]', here ? 'fill-ink font-semibold' : done ? 'fill-ink' : 'fill-slate-400')}>
                {stageById(s).shortLabel}
              </text>
              {date && !skipped && (
                <text x={x(s)} y={Y + 42} textAnchor="middle" className="num fill-slate text-[11px]">
                  {fmtDay(date)}
                </text>
              )}
              {here && (
                <text x={x(s)} y={Y - 22} textAnchor="middle" className="fill-lagoon text-[12px] font-semibold">Now</text>
              )}
            </g>
          );
        })}

        {/* Side stage branch (review after negative, paused, exited) */}
        {onSide && sideAnchor && (() => {
          const ax = x(sideAnchor);
          const left = ax > W - 340;
          const nx = left ? ax - 100 : ax + 100;
          const tx = left ? ax - 118 : ax + 118;
          return (
            <g>
              <path d={left ? `M ${ax} ${Y + 6} C ${ax} ${Y + 70}, ${ax - 40} ${Y + 86}, ${ax - 90} ${Y + 86}` : `M ${ax} ${Y + 6} C ${ax} ${Y + 70}, ${ax + 40} ${Y + 86}, ${ax + 90} ${Y + 86}`} fill="none" stroke="#D9971E" strokeWidth={2} />
              <circle cx={nx} cy={Y + 86} r={15} fill="#D9971E" opacity={0.18} />
              <circle cx={nx} cy={Y + 86} r={9} fill="#D9971E" />
              <text x={tx} y={Y + 82} textAnchor={left ? 'end' : 'start'} className="fill-ink text-[13px] font-semibold">
                Now: {stageById(current).label}
              </text>
              <text x={tx} y={Y + 98} textAnchor={left ? 'end' : 'start'} className="num fill-slate text-[11px]">
                since {fmtDay(patient.stageEnteredOn)}
                {patient.pausedUntil ? ` · pause ${patient.pausedUntil < '2026-10-12' ? 'ended' : 'until'} ${fmtDay(patient.pausedUntil)}` : ''}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}
