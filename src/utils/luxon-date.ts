import { DateTime } from 'luxon';

const dateFormat = 'yyyy-MM-dd';

export type LuxonType = DateTime<true> | DateTime<false>;

export function getLuxonTimezone(): string {
  return DateTime.local().zoneName;
}

export function getLuxonNow(timezone?: string): LuxonType {
  const now = DateTime.now();
  return timezone ? now.setZone(timezone) : now;
}

export function getLuxonDate(
  yyyy_mm_dd: string,
  hh_mm_ss?: string,
  timezone?: string,
): LuxonType {
  let date = DateTime.fromFormat(yyyy_mm_dd, dateFormat, {
    zone: timezone,
    setZone: true,
  });
  if (hh_mm_ss) {
    date = date.set(extractTime(hh_mm_ss));
  }
  return date;
}

export function getLuxonDateToString(
  luxonDate: LuxonType,
  format?: string,
): string {
  return luxonDate.toFormat(format || dateFormat);
}

export function isLuxonValidTimezone(timezone: string): boolean {
  return getLuxonNow(timezone).isValid;
}

export function getLuxonDiffToNow(
  luxonDate: LuxonType,
  diffInWhat:
    | 'seconds'
    | 'minutes'
    | 'hours'
    | 'days'
    | 'months'
    | 'years' = 'seconds',
): number {
  const result = luxonDate.diffNow(diffInWhat).as(diffInWhat);
  return Math.ceil(result || 0);
}

function extractTime(hh_mm_ss: string): {
  hour: number;
  minute: number;
  second: number;
} {
  const [hour = 0, minute = 0, second = 0] = hh_mm_ss.split(':').map(Number);
  return { hour, minute, second };
}
