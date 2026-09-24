import * as React from 'react';
import * as T from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = T.Root;
export const TabsContent = T.Content;

export const TabsList = React.forwardRef<React.ElementRef<typeof T.List>, React.ComponentPropsWithoutRef<typeof T.List>>(({ className, ...props }, ref) => (
  <T.List ref={ref} className={cn('flex gap-6 overflow-x-auto border-b border-line', className)} {...props} />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<React.ElementRef<typeof T.Trigger>, React.ComponentPropsWithoutRef<typeof T.Trigger>>(({ className, ...props }, ref) => (
  <T.Trigger
    ref={ref}
    className={cn(
      '-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 border-transparent pb-2.5 pt-1 text-sm text-slate transition-colors hover:text-ink',
      'data-[state=active]:border-lagoon data-[state=active]:font-medium data-[state=active]:text-ink focus-visible:ring-offset-0',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';
