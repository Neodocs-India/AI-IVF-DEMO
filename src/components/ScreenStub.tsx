import type { ReactNode } from 'react';
import { PageHeader } from './PageHeader';

/** Temporary body for screens not yet built. Removed as each milestone lands. */
export function ScreenStub({ title, meta, milestone, scope }: { title: ReactNode; meta?: ReactNode; milestone: number; scope: string }) {
  return (
    <>
      <PageHeader title={title} meta={meta} />
      <div className="rounded border border-dashed border-line-strong bg-paper px-6 py-10">
        <p className="text-sm text-ink">{scope}</p>
        <p className="mt-1 text-xs text-slate">Built in milestone {milestone} of the build plan.</p>
      </div>
    </>
  );
}
