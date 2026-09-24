import * as React from 'react';
import * as D from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = D.Root;
export const DialogTrigger = D.Trigger;
export const DialogClose = D.Close;

const Overlay = React.forwardRef<React.ElementRef<typeof D.Overlay>, React.ComponentPropsWithoutRef<typeof D.Overlay>>(({ className, ...props }, ref) => (
  <D.Overlay ref={ref} className={cn('fixed inset-0 z-50 bg-ink/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0', className)} {...props} />
));
Overlay.displayName = 'Overlay';

/** Centred modal dialog. */
export function DialogContent({ className, children, title, description, wide, ...props }: Omit<React.ComponentPropsWithoutRef<typeof D.Content>, 'title'> & { title: React.ReactNode; description?: React.ReactNode; wide?: boolean }) {
  return (
    <D.Portal>
      <Overlay />
      <D.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[calc(100vw-32px)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded border border-line bg-paper shadow-pop focus-visible:ring-0',
          wide ? 'max-w-3xl' : 'max-w-xl',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]',
          className,
        )}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
          <div>
            <D.Title className="text-lg font-semibold text-ink">{title}</D.Title>
            {description ? <D.Description className="mt-0.5 text-sm text-slate">{description}</D.Description> : <D.Description className="sr-only">Dialog</D.Description>}
          </div>
          <D.Close className="rounded p-1 text-slate hover:bg-mist hover:text-ink" aria-label="Close">
            <X className="h-4 w-4" />
          </D.Close>
        </div>
        {children}
      </D.Content>
    </D.Portal>
  );
}

/** Right-side drawer (sheet). */
export function Sheet({ open, onOpenChange, children, title, description, width = 560, header }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  width?: number;
  header?: React.ReactNode;
}) {
  return (
    <D.Root open={open} onOpenChange={onOpenChange}>
      <D.Portal>
        <Overlay className="bg-ink/15" />
        <D.Content
          style={{ width: `min(${width}px, 100vw)` }}
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex flex-col border-l border-line bg-paper shadow-drawer focus-visible:ring-0',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200',
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-4">
            <div className="min-w-0 flex-1">
              <D.Title asChild>
                <div>{title}</div>
              </D.Title>
              {description ? <D.Description asChild><div className="mt-1 text-sm text-slate">{description}</div></D.Description> : <D.Description className="sr-only">Details</D.Description>}
              {header}
            </div>
            <D.Close className="rounded p-1 text-slate hover:bg-mist hover:text-ink" aria-label="Close">
              <X className="h-4 w-4" />
            </D.Close>
          </div>
          <div className="flex-1 overflow-y-auto">{children}</div>
        </D.Content>
      </D.Portal>
    </D.Root>
  );
}
