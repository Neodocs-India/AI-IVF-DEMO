import { useState } from 'react';
import type { Language, Message } from '@/data/types';
import { fmtDateTime } from '@/lib/dates';
import { cn } from '@/lib/utils';
import { Empty } from './Panel';

const STATUS_TONE: Record<Message['status'], string> = {
  Unanswered: 'text-[#9A6A12]',
  Read: 'text-slate',
  Delivered: 'text-slate',
  Replied: 'text-sage',
};

/** Staff view of a WhatsApp/SMS thread with original language and English translation. */
export function MessageThread({ messages, language, compact }: { messages: Message[]; language: Language; compact?: boolean }) {
  const hasTranslation = messages.some((m) => m.textEnglish);
  const [english, setEnglish] = useState(false);
  if (!messages.length) return <Empty>No messages yet.</Empty>;
  return (
    <div>
      {hasTranslation && (
        <div className="mb-3 flex items-center gap-1 text-xs">
          <button type="button" onClick={() => setEnglish(false)} className={cn('rounded px-2 py-1', !english ? 'bg-ink text-white' : 'text-slate hover:bg-mist')}>
            {language}
          </button>
          <button type="button" onClick={() => setEnglish(true)} className={cn('rounded px-2 py-1', english ? 'bg-ink text-white' : 'text-slate hover:bg-mist')}>
            English translation
          </button>
        </div>
      )}
      <ol className="space-y-3">
        {messages.map((m) => {
          const text = english && m.textEnglish ? m.textEnglish : m.textOriginal;
          const inbound = m.direction === 'Inbound';
          return (
            <li key={m.id} className={cn('flex', inbound ? 'justify-start' : 'justify-end')}>
              <div
                className={cn(
                  'max-w-[85%] rounded px-3 py-2',
                  inbound ? 'border border-line bg-paper' : 'bg-lagoon-50',
                  m.highlight && 'ring-2 ring-rose ring-offset-2',
                )}
              >
                <p lang={!english && m.textEnglish ? (language === 'Marathi' ? 'mr' : language === 'Hindi' ? 'hi' : undefined) : undefined} className={cn('whitespace-pre-line text-ink', compact ? 'text-sm' : 'text-[15px] leading-6')}>
                  {text}
                </p>
                <p className="num mt-1 flex flex-wrap gap-x-2 text-[11px] text-slate">
                  <span>{m.channel}</span>
                  <span>{inbound ? 'from patient' : m.sentBy}</span>
                  <span>{fmtDateTime(m.at)}</span>
                  <span className={STATUS_TONE[m.status]}>{m.status}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
