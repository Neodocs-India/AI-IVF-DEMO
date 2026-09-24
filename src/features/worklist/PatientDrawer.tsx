import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, CalendarPlus, HeartHandshake, MessageCircle, Phone, ShieldAlert, TimerReset, UserRoundCog } from 'lucide-react';
import type { Patient } from '@/data/types';
import { staffById } from '@/data/constants';
import { useDemo } from '@/store/demo';
import * as S from '@/lib/selectors';
import { fmtDate, fmtDateTime } from '@/lib/dates';
import { Sheet } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RiskBadge, SourceChip, StageChip, TrendIcon } from '@/components/Badges';
import { RiskFactors } from '@/components/RiskFactors';
import { MessageThread } from '@/components/MessageThread';
import { CallDialog } from './CallDialog';
import { WhatsAppDialog } from './WhatsAppDialog';

export function PatientDrawer({ patientId, onClose }: { patientId: string | null; onClose: () => void }) {
  const patient = useDemo((s) => s.patients.find((p) => p.id === patientId));
  return (
    <Sheet
      open={!!patientId && !!patient}
      onOpenChange={(o) => !o && onClose()}
      width={600}
      title={patient ? <DrawerTitle p={patient} /> : null}
    >
      {patient && <DrawerBody p={patient} onClose={onClose} />}
    </Sheet>
  );
}

function DrawerTitle({ p }: { p: Patient }) {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="font-serif text-xl font-medium text-ink">{p.name}</h2>
        <RiskBadge score={p.risk.score} band={p.risk.band} animate />
        <TrendIcon trend={p.risk.trend} />
      </div>
      <p className="mt-1 text-sm text-slate">
        {p.age} y{p.partner && <> · with {p.partner.name}, {p.partner.age} y</>} · {p.id} · {p.locality}, {p.distanceKm} km
      </p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate">
        <StageChip stage={p.stage} />
        <span>{p.language}</span>
        <span>·</span>
        <span>Prefers {p.preferredChannel}</span>
        <span>·</span>
        <span className="num">{p.phoneMasked}</span>
      </div>
    </div>
  );
}

function Section({ title, children, meta }: { title: string; children: React.ReactNode; meta?: React.ReactNode }) {
  return (
    <section className="border-b border-line px-6 py-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {meta && <span className="text-xs text-slate">{meta}</span>}
      </div>
      {children}
    </section>
  );
}

function DrawerBody({ p, onClose }: { p: Patient; onClose: () => void }) {
  const [callOpen, setCallOpen] = useState(false);
  const [waOpen, setWaOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);
  const book = useDemo((s) => s.bookAppointment);
  const refer = useDemo((s) => s.referToCounsellor);
  const escalate = useDemo((s) => s.escalateToDoctor);
  const snooze = useDemo((s) => s.snooze);
  const overdue = S.isOverdueNow(p);
  const rule = S.ruleById(p.overdueRuleId);
  const recent = [...p.timeline].sort((a, b) => b.at.localeCompare(a.at)).slice(0, 3);

  return (
    <div className="flex min-h-full flex-col">
      {/* Why this patient is here */}
      <div className="border-b border-line bg-mist/60 px-6 py-4">
        <AnimatePresence mode="wait">
          {overdue ? (
            <motion.div key="od" exit={{ opacity: 0 }}>
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-base text-ink">{S.reasonFor(p)}</p>
                <span className="num shrink-0 text-sm font-medium text-[#9A6A12]">{p.overdueDays} days overdue</span>
              </div>
              {rule && (
                <p className="mt-1 text-xs text-slate">
                  Rule {rule.id} · {rule.name} ({rule.thresholdLabel}){rule.sensitive && <> · <span className="text-ink">Sensitive: human contact only</span></>}
                </p>
              )}
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-base text-ink">{p.nextAppointment ? `${p.nextAppointment.type} booked: ${p.nextAppointment.on === '2026-10-12' ? 'today' : fmtDate(p.nextAppointment.on)} at ${p.nextAppointment.time} with ${staffById(p.nextAppointment.withId).name}` : `Next: ${p.nextExpectedEvent.label}, ${fmtDate(p.nextExpectedEvent.dueOn)}`}</p>
              <p className="mt-1 text-xs text-sage">Not overdue{p.lastContactOn ? ` · last contact ${fmtDate(p.lastContactOn)}` : ''}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Actions */}
      <div className="border-b border-line px-6 py-4" data-tour="drawer-actions">
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setCallOpen(true)} data-tour="log-call"><Phone /> Log call</Button>
          <Button variant="secondary" onClick={() => setWaOpen(true)}><MessageCircle /> Send WhatsApp</Button>
          <Button variant="secondary" onClick={() => book(p.id)}><CalendarPlus /> Book appointment</Button>
          <Button variant="secondary" onClick={() => refer(p.id)}><HeartHandshake /> Refer to counsellor</Button>
          <Button variant="secondary" onClick={() => escalate(p.id)}><UserRoundCog /> Escalate to doctor</Button>
          <div className="relative">
            <Button variant="secondary" onClick={() => setSnoozeOpen((o) => !o)}><TimerReset /> Snooze</Button>
            {snoozeOpen && (
              <div className="absolute left-0 top-10 z-10 w-40 rounded border border-line bg-paper p-1 shadow-pop">
                {[3, 7, 14].map((d) => (
                  <button key={d} type="button" className="block w-full rounded px-3 py-1.5 text-left text-sm hover:bg-mist" onClick={() => { snooze(p.id, d); setSnoozeOpen(false); onClose(); }}>
                    Snooze {d} days
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button variant="ghost" asChild>
            <Link to={`/patients/${p.id}`} data-tour="open-record"><ArrowUpRight /> Open full record</Link>
          </Button>
        </div>
      </div>

      <Section title="Risk of dropping out" meta={<span className="num">Score {p.risk.score} of 100</span>}>
        <RiskFactors risk={p.risk} />
      </Section>

      <Section title="Suggested actions" meta="AI suggestion · review before acting">
        <ul className="space-y-2">
          {p.risk.suggestedActions.map((a) => (
            <li key={a} className="flex gap-2.5 text-sm text-ink">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-lagoon" />
              {a}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recent events">
        <ol className="space-y-3">
          {recent.map((e) => (
            <li key={e.at + e.title} className="grid grid-cols-[92px_1fr] gap-3 text-sm">
              <span className="num text-xs text-slate">{fmtDateTime(e.at)}</span>
              <span>
                <span className="text-ink">{e.title}</span> <SourceChip source={e.source} />
                {e.detail && <span className="mt-0.5 block text-xs text-slate">{e.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Messages" meta={`${p.messages.length} in thread`}>
        {p.staffNote && (
          <div className="mb-3 flex gap-2 rounded border border-saffron/40 bg-saffron-50 px-3 py-2 text-xs text-ink">
            <ShieldAlert className="h-4 w-4 shrink-0 text-saffron" />
            {p.staffNote}
          </div>
        )}
        <MessageThread messages={p.messages} language={p.language} compact />
      </Section>

      <CallDialog patient={p} open={callOpen} onOpenChange={setCallOpen} />
      <WhatsAppDialog patient={p} open={waOpen} onOpenChange={setWaOpen} />
    </div>
  );
}
