import * as React from 'react';
import * as S from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export const Switch = React.forwardRef<React.ElementRef<typeof S.Root>, React.ComponentPropsWithoutRef<typeof S.Root>>(({ className, ...props }, ref) => (
  <S.Root
    ref={ref}
    className={cn('relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-transparent bg-line-strong transition-colors data-[state=checked]:bg-lagoon', className)}
    {...props}
  >
    <S.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-paper shadow transition-transform data-[state=checked]:translate-x-[18px]" />
  </S.Root>
));
Switch.displayName = 'Switch';
