import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { AiSummary } from '@/data/scripts';
import { AI_DISCLAIMER } from '@/data/scripts';
import { SourceChip } from '@/components/Badges';

/**
 * Renders a pre-written summary with a short typing animation the first time it is opened,
 * then statically (§8.4). Source chips appear as each line completes.
 */
export function TypedSummary({ summary, animate, onDone }: { summary: AiSummary; animate: boolean; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;

  // Flatten into typed segments: title, subtitle, headings and lines
  const segments = useMemo(() => {
    const out: { key: string; text: string }[] = [{ key: 'title', text: summary.title }, { key: 'subtitle', text: summary.subtitle }];
    summary.sections.forEach((s, i) => {
      out.push({ key: `h${i}`, text: s.heading });
      s.lines.forEach((l, j) => out.push({ key: `l${i}-${j}`, text: l.text }));
    });
    return out;
  }, [summary]);
  const total = segments.reduce((s, x) => s + x.text.length, 0);
  const [chars, setChars] = useState(play ? 0 : total);

  useEffect(() => {
    if (!play) {
      onDone?.();
      return;
    }
    const perTick = Math.max(3, Math.round(total / 190)); // ~4 s total at 20 ms ticks
    const id = setInterval(() => {
      setChars((c) => {
        const next = Math.min(total, c + perTick);
        if (next >= total) {
          clearInterval(id);
          onDone?.();
        }
        return next;
      });
    }, 20);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [play, total]);

  // How many characters of each segment are visible
  const visible = new Map<string, number>();
  let budget = chars;
  for (const seg of segments) {
    const n = Math.max(0, Math.min(seg.text.length, budget));
    visible.set(seg.key, n);
    budget -= seg.text.length;
  }
  const typingKey = segments.find((s) => (visible.get(s.key) ?? 0) < s.text.length && (visible.get(s.key) ?? 0) > 0)?.key;
  const show = (key: string, text: string) => {
    const n = visible.get(key) ?? 0;
    return (
      <>
        {text.slice(0, n)}
        {typingKey === key && <span className="ml-px inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-lagoon" />}
      </>
    );
  };
  const done = (key: string, text: string) => (visible.get(key) ?? 0) >= text.length;
  const started = (key: string) => (visible.get(key) ?? 0) > 0;

  return (
    <div className="font-serif text-ink">
      <h2 className="min-h-[32px] text-lg font-semibold leading-snug">{show('title', summary.title)}</h2>
      <p className="mt-1 min-h-[24px] text-base text-slate">{show('subtitle', summary.subtitle)}</p>
      {summary.sections.map((sec, i) =>
        started(`h${i}`) ? (
          <section key={sec.heading} className="mt-6">
            <h3 className="mb-2 font-sans text-sm font-semibold text-ink">{show(`h${i}`, sec.heading)}</h3>
            <ul className="space-y-2">
              {sec.lines.map((l, j) =>
                started(`l${i}-${j}`) ? (
                  <li key={j} className="flex gap-3 text-base leading-7">
                    <span className="mt-3 h-1 w-1 shrink-0 rounded-full bg-slate" />
                    <span>
                      {show(`l${i}-${j}`, l.text)}
                      {done(`l${i}-${j}`, l.text) && l.chips.map((c, k) => <SourceChip key={k} source={c.source} date={c.date} className="ml-1.5" />)}
                    </span>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null,
      )}
      <p className="mt-8 border-t border-line pt-3 font-sans text-xs italic text-slate">{AI_DISCLAIMER}</p>
    </div>
  );
}
