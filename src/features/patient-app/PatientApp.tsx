import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BadgeCheck, CalendarDays, Check, CheckCheck, ChevronLeft, Mic, Paperclip, Snowflake, Wifi, BatteryFull, SignalHigh } from 'lucide-react';
import { useDemo, usePatient } from '@/store/demo';
import { HERO_IDS } from '@/data/heroes';
import { PHONE_UI } from '@/data/scripts';
import type { Message } from '@/data/types';
import { fmt12h, fmtDay, isToday } from '@/lib/dates';
import { cn } from '@/lib/utils';

type Lang = 'Marathi' | 'English';

export default function PatientApp() {
  const [lang, setLang] = useState<Lang>('Marathi');
  const [tab, setTab] = useState<'chat' | 'journey'>('chat');
  const ui = PHONE_UI[lang];

  return (
    <div className="flex flex-col items-center">
      <div className="mb-5 flex w-full max-w-[420px] items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Priya’s phone</h1>
          <p className="text-xs text-slate">What the patient sees: messages from the clinic and her journey</p>
        </div>
        <div className="flex items-center gap-1 rounded border border-line bg-paper p-0.5 text-xs" role="group" aria-label="Language">
          {(['Marathi', 'English'] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded px-2.5 py-1', lang === l ? 'bg-ink text-white' : 'text-slate hover:bg-mist')}>
              {l === 'Marathi' ? 'मराठी' : 'English'}
            </button>
          ))}
        </div>
      </div>

      <PhoneFrame>
        {/* In-app tabs */}
        <div className="flex border-b border-line bg-paper text-[13px]" lang={lang === 'Marathi' ? 'mr' : 'en'}>
          {(['chat', 'journey'] as const).map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)} className={cn('flex-1 border-b-2 py-2.5', tab === t ? 'border-lagoon font-semibold text-ink' : 'border-transparent text-slate')}>
              {t === 'chat' ? ui.chat : ui.journey}
            </button>
          ))}
        </div>
        {tab === 'chat' ? <Chat lang={lang} /> : <Journey lang={lang} onAsk={() => setTab('chat')} />}
      </PhoneFrame>
      <p className="mt-4 max-w-[420px] text-center text-xs text-slate">Marathi text is marked for review by a native speaker before use with patients.</p>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative rounded-[52px] bg-ink p-[11px] shadow-[0_30px_60px_-20px_rgba(24,38,58,0.45)] ring-1 ring-ink-600" style={{ width: 360, height: 700 }}>
      <div className="relative flex h-full flex-col overflow-hidden rounded-[42px] bg-paper">
        {/* Status bar */}
        <div className="relative flex h-11 shrink-0 items-center justify-between bg-paper px-7 pt-1 text-[13px] font-semibold text-ink">
          <span className="num">09:32</span>
          <span className="absolute left-1/2 top-2.5 h-[26px] w-[96px] -translate-x-1/2 rounded-full bg-ink" aria-hidden />
          <span className="flex items-center gap-1"><SignalHigh className="h-4 w-4" /><Wifi className="h-4 w-4" /><BatteryFull className="h-4 w-4" /></span>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        <div className="flex h-6 shrink-0 items-center justify-center bg-paper"><span className="h-1 w-28 rounded-full bg-ink/80" /></div>
      </div>
    </div>
  );
}

function Chat({ lang }: { lang: Lang }) {
  const ui = PHONE_UI[lang];
  const priya = usePatient(HERO_IDS.priya)!;
  const replyShown = useDemo((s) => s.flags.priyaReplyShown);
  const setReplyShown = useDemo((s) => s.setPriyaReplyShown);
  const hasReply = priya.messages.some((m) => m.direction === 'Inbound');
  const [revealReply, setRevealReply] = useState(replyShown);

  useEffect(() => {
    if (hasReply && !replyShown) {
      const t = setTimeout(() => {
        setRevealReply(true);
        setReplyShown();
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [hasReply, replyShown, setReplyShown]);

  const msgs = priya.messages.filter((m) => m.direction === 'Outbound' || revealReply);
  const scroller = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [msgs.length, hasReply, revealReply]);
  let lastDay = '';

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Chat header */}
      <div className="flex items-center gap-2.5 border-b border-line bg-paper px-3 py-2.5">
        <ChevronLeft className="h-5 w-5 text-lagoon" />
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon font-serif text-base text-white">A</span>
        <div className="min-w-0 leading-tight">
          <div className="flex items-center gap-1 text-[14px] font-semibold text-ink">Aarambh Fertility Centre <BadgeCheck className="h-4 w-4 fill-lagoon text-white" /></div>
          <div className="text-[11px] text-slate" lang={lang === 'Marathi' ? 'mr' : 'en'}>{ui.verified} · {ui.online}</div>
        </div>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 space-y-2 overflow-y-auto bg-[#EEF2F4] px-3 py-3" lang={lang === 'Marathi' ? 'mr' : 'en'}>
        {msgs.map((m) => {
          const day = m.at.slice(0, 10);
          const sep = day !== lastDay;
          lastDay = day;
          return (
            <div key={m.id}>
              {sep && <div className="my-2 text-center"><span className="rounded-full bg-paper/90 px-2.5 py-0.5 text-[11px] text-slate">{isToday(day) ? ui.today : fmtDay(day)}</span></div>}
              <Bubble m={m} lang={lang} animate={m.direction === 'Inbound' && !replyShown} />
            </div>
          );
        })}
        <AnimatePresence>
          {hasReply && !revealReply && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-end">
              <span className="flex gap-1 rounded-2xl rounded-br-md bg-lagoon-100 px-3 py-2.5">
                {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-lagoon/60" style={{ animationDelay: `${i * 120}ms` }} />)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-line bg-paper px-3 py-2">
        <Paperclip className="h-5 w-5 text-slate" />
        <span className="flex-1 rounded-full bg-mist px-3.5 py-2 text-[13px] text-slate" lang={lang === 'Marathi' ? 'mr' : 'en'}>{ui.typeMessage}</span>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lagoon text-white"><Mic className="h-4 w-4" /></span>
      </div>
    </div>
  );
}

function Bubble({ m, lang, animate }: { m: Message; lang: Lang; animate: boolean }) {
  // In Priya's phone, clinic messages arrive on the left; her own replies go out on the right.
  const mine = m.direction === 'Inbound';
  const text = lang === 'English' && m.textEnglish ? m.textEnglish : m.textOriginal;
  return (
    <motion.div initial={animate ? { opacity: 0, y: 10 } : false} animate={{ opacity: 1, y: 0 }} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[82%] rounded-2xl px-3 py-2 shadow-[0_1px_0_rgba(24,38,58,0.06)]', mine ? 'rounded-br-md bg-lagoon-100 text-ink' : 'rounded-bl-md bg-paper text-ink')}>
        {!mine && m.sentBy !== 'Automated' && <div className="mb-0.5 text-[11px] font-semibold text-lagoon">{m.sentBy}</div>}
        <p className={cn('text-[14px] leading-[1.45]', lang === 'Marathi' && m.textEnglish && 'font-deva')}>{text}</p>
        <div className="num mt-0.5 flex items-center justify-end gap-1 text-[10px] text-slate">
          {fmt12h(m.at.slice(11, 16))}
          {mine && <CheckCheck className="h-3 w-3 text-lagoon" />}
        </div>
      </div>
    </motion.div>
  );
}

function Journey({ lang, onAsk }: { lang: Lang; onAsk: () => void }) {
  const ui = PHONE_UI[lang];
  const priya = usePatient(HERO_IDS.priya)!;
  const appt = priya.nextAppointment;
  const current = 4;
  return (
    <div className="min-h-0 flex-1 overflow-y-auto bg-mist px-4 py-5" lang={lang === 'Marathi' ? 'mr' : 'en'}>
      <h2 className={cn('text-[22px] text-ink', lang === 'Marathi' ? 'font-deva font-semibold' : 'font-serif')}>{ui.greeting}</h2>
      <p className="mt-1 text-[13px] text-slate">{ui.journeyIntro}</p>

      {/* Simplified journey rail — same language as the clinic's rail, fewer words */}
      <div className="mt-5 rounded-2xl bg-paper px-4 pb-4 pt-5">
        <div className="relative flex justify-between">
          <span className="absolute left-2 right-2 top-[7px] h-[2px] bg-line" />
          <span className="absolute left-2 top-[7px] h-[2px] bg-lagoon" style={{ width: `${(current / (ui.steps.length - 1)) * 100 - 3}%` }} />
          {ui.steps.map((s, i) => (
            <span key={s} className="relative z-10 flex flex-col items-center">
              <span className={cn('flex h-4 w-4 items-center justify-center rounded-full border-2', i < current ? 'border-lagoon bg-lagoon' : i === current ? 'border-saffron bg-paper ring-4 ring-saffron/20' : 'border-line bg-paper')}>
                {i < current && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
              </span>
            </span>
          ))}
        </div>
        <div className="mt-4 text-[12px] text-slate">{ui.youAreHere}</div>
        <div className={cn('text-[17px] text-ink', lang === 'Marathi' ? 'font-deva font-semibold' : 'font-serif')}>{ui.steps[current]}</div>
        <div className="mt-1 text-[12px] text-slate">{ui.steps.slice(0, current).join(' · ')}</div>
      </div>

      <div className="mt-3 rounded-2xl bg-paper px-4 py-4">
        <div className="flex items-center gap-2 text-[12px] text-slate"><CalendarDays className="h-4 w-4 text-lagoon" />{ui.nextAppointment}</div>
        {appt ? (
          <>
            <div className={cn('mt-1.5 text-[17px] text-ink', lang === 'Marathi' ? 'font-deva font-semibold' : 'font-serif')}>{ui.today}, {fmt12h(appt.time)}</div>
            <div className="text-[13px] text-ink">{ui.withDoctor}</div>
            <div className="mt-1 text-[12px] text-slate">{ui.counsellor}</div>
          </>
        ) : (
          <p className="mt-1.5 text-[13px] text-ink">{ui.noAppointment}</p>
        )}
      </div>

      <div className="mt-3 rounded-2xl bg-paper px-4 py-4">
        <div className="flex items-center gap-2 text-[12px] text-slate"><Snowflake className="h-4 w-4 text-[#2F6F8F]" /></div>
        <div className={cn('mt-1 text-[17px] text-ink', lang === 'Marathi' ? 'font-deva font-semibold' : 'font-serif')}>{ui.embryos}</div>
        <p className="mt-1 text-[13px] leading-5 text-slate">{ui.embryosDetail}</p>
      </div>

      <button type="button" onClick={onAsk} className="mt-4 w-full rounded-full bg-lagoon py-3 text-[14px] font-medium text-white">{ui.ask}</button>
    </div>
  );
}
