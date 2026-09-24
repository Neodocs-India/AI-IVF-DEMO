import { cn, initials } from '@/lib/utils';

const TONES = {
  lagoon: 'bg-lagoon-100 text-lagoon-700',
  saffron: 'bg-saffron-100 text-ink',
  sage: 'bg-sage-100 text-sage',
  rose: 'bg-rose-100 text-rose',
  slate: 'bg-line text-ink',
  ink: 'bg-ink-600 text-white',
} as const;

export function Avatar({
  name,
  tone = 'slate',
  size = 32,
  className,
}: {
  name: string;
  tone?: keyof typeof TONES;
  size?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full font-semibold', TONES[tone], className)}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }}
    >
      {initials(name)}
    </span>
  );
}
