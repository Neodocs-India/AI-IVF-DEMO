import { DEMO_TODAY } from '@/data/constants';

// All data dates are IST wall-clock strings ('YYYY-MM-DD' or 'YYYY-MM-DDTHH:mm').
// Arithmetic is done in UTC on the date part so it never depends on the viewer's timezone.

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const toUtc = (d: string) => {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return Date.UTC(y!, m! - 1, day!);
};

export function addDays(d: string, n: number): string {
  const t = new Date(toUtc(d) + n * 86_400_000);
  return t.toISOString().slice(0, 10);
}

/** Whole days from a to b (b − a). */
export const daysBetween = (a: string, b: string) => Math.round((toUtc(b) - toUtc(a)) / 86_400_000);
export const daysSince = (d: string) => daysBetween(d, DEMO_TODAY);
export const daysUntil = (d: string) => daysBetween(DEMO_TODAY, d);
export const isToday = (d: string) => d.slice(0, 10) === DEMO_TODAY;

/** '13 Sep 2026' */
export function fmtDate(d: string): string {
  const [y, m, day] = d.slice(0, 10).split('-').map(Number);
  return `${day} ${MONTHS[m! - 1]} ${y}`;
}
/** '13 Sep' */
export function fmtDay(d: string): string {
  const [, m, day] = d.slice(0, 10).split('-').map(Number);
  return `${day} ${MONTHS[m! - 1]}`;
}
/** 'March 2026' */
export function fmtMonth(d: string): string {
  const [y, m] = d.slice(0, 7).split('-').map(Number);
  return `${MONTHS_LONG[m! - 1]} ${y}`;
}
/** 'Mar 2026' */
export function fmtMonthShort(d: string): string {
  const [y, m] = d.slice(0, 7).split('-').map(Number);
  return `${MONTHS[m! - 1]} ${y}`;
}
/** '22 Sep, 11:04' — or 'Today, 09:24' */
export function fmtDateTime(d: string): string {
  const time = d.length > 10 ? d.slice(11, 16) : '';
  const day = isToday(d) ? 'Today' : fmtDay(d);
  return time ? `${day}, ${time}` : day;
}
/** '4:30 pm' from '16:30' */
export function fmt12h(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h! >= 12 ? 'pm' : 'am';
  const h12 = h! % 12 === 0 ? 12 : h! % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

/** Human duration: '29 days', '9 months', '3 yr 11 mo' */
export function fmtDuration(days: number): string {
  if (days < 60) return `${days} day${days === 1 ? '' : 's'}`;
  const months = Math.floor(days / 30.44);
  if (months < 24) return `${months} months`;
  const y = Math.floor(months / 12);
  const mo = months % 12;
  return mo ? `${y} yr ${mo} mo` : `${y} years`;
}

export function relativeDays(d: string): string {
  const n = daysSince(d);
  if (n === 0) return 'Today';
  if (n === 1) return 'Yesterday';
  if (n > 0) return `${n} days ago`;
  if (n === -1) return 'Tomorrow';
  return `In ${-n} days`;
}
