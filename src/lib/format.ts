import { format } from 'date-fns';
import { DEMO_NOW } from '@/data/constants';

const IST_OFFSET_MIN = 330;

/**
 * Shift an instant so date-fns (which formats in the viewer's local zone) prints
 * the Mumbai wall-clock time. Keeps "09:10 IST" correct on any presenter's laptop.
 */
export const toIst = (d: Date) => new Date(d.getTime() + (IST_OFFSET_MIN + d.getTimezoneOffset()) * 60_000);

/** "Monday, 12 October 2026" */
export const longDate = (d: Date = DEMO_NOW) => format(toIst(d), 'EEEE, d MMMM yyyy');
/** "12 Oct 2026" */
export const shortDate = (d: Date) => format(toIst(d), 'd MMM yyyy');
/** "09:10" */
export const clock = (d: Date = DEMO_NOW) => format(toIst(d), 'HH:mm');

export function greeting(d: Date = DEMO_NOW) {
  const h = toIst(d).getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}
