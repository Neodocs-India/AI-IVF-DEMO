import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** A quiet bordered surface with an optional heading row. */
export function Panel({ title, meta, action, children, className, bodyClassName, id }: { title?: ReactNode; meta?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; bodyClassName?: string; id?: string }) {
  return (
    <section id={id} className={cn('rounded border border-line bg-paper', className)}>
      {(title || action) && (
        <header className="flex items-baseline justify-between gap-4 border-b border-line px-5 py-3">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-ink">{title}</h2>
            {meta && <p className="text-xs text-slate">{meta}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={cn('px-5 py-4', bodyClassName)}>{children}</div>
    </section>
  );
}

export function Label({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-xs text-slate', className)}>{children}</div>;
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-slate">{children}</p>;
}
