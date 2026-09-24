import type { ReactNode } from 'react';

export function PageHeader({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
        {meta && <p className="mt-1 text-sm text-slate">{meta}</p>}
      </div>
      {children}
    </header>
  );
}
