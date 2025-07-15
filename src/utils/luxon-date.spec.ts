import { DateTime } from 'luxon';

import {
  getLuxonDate,
  getLuxonDateToString,
  getLuxonDiffToNow,
  getLuxonNow,
  getLuxonTimezone,
  isLuxonValidTimezone,
} from './luxon-date';

describe('luxon-date utils', () => {
  test('getLuxonTimezone returns a string', () => {
    const timezone = getLuxonTimezone();
    expect(typeof timezone).toBe('string');
    expect(timezone.length).toBeGreaterThan(0);
  });

  test('getLuxonNow returns current DateTime without timezone', () => {
    const now = getLuxonNow();
    expect(now).toBeInstanceOf(DateTime);
    expect(now.isValid).toBe(true);
  });

  test('getLuxonNow returns DateTime with specified timezone', () => {
    const timezone = 'America/New_York';
    const now = getLuxonNow(timezone);
    expect(now.zoneName).toBe(timezone);
    expect(now.isValid).toBe(true);
  });

  test('getLuxonDate parses date string without time and timezone', () => {
    const dateStr = '2023-06-15';
    const date = getLuxonDate(dateStr);
    expect(date.isValid).toBe(true);
    expect(date.toFormat('yyyy-MM-dd')).toBe(dateStr);
  });

  test('getLuxonDate parses date string with time and timezone', () => {
    const dateStr = '2023-06-15';
    const timeStr = '14:30:15';
    const timezone = 'Europe/London';
    const date = getLuxonDate(dateStr, timeStr, timezone);
    expect(date.isValid).toBe(true);
    expect(date.toFormat('yyyy-MM-dd')).toBe(dateStr);
    expect(date.hour).toBe(14);
    expect(date.minute).toBe(30);
    expect(date.second).toBe(15);
    expect(date.zoneName).toBe(timezone);
  });

  test('getLuxonDateToString formats date with default format', () => {
    const date = getLuxonDate('2023-06-15');
    const formatted = getLuxonDateToString(date);
    expect(formatted).toBe('2023-06-15');
  });

  test('getLuxonDateToString formats date with custom format', () => {
    const date = getLuxonDate('2023-06-15');
    const formatted = getLuxonDateToString(date, 'dd/MM/yyyy');
    expect(formatted).toBe('15/06/2023');
  });

  test('isLuxonValidTimezone returns true for valid timezone', () => {
    expect(isLuxonValidTimezone('Asia/Tokyo')).toBe(true);
  });

  test('isLuxonValidTimezone returns false for invalid timezone', () => {
    expect(isLuxonValidTimezone('Invalid/Timezone')).toBe(false);
  });

  test('getLuxonDiffToNow returns difference in seconds by default', () => {
    const now = getLuxonNow();
    const diff = getLuxonDiffToNow(now);
    expect(typeof diff).toBe('number');
  });

  test('getLuxonDiffToNow returns difference in specified units', () => {
    const now = getLuxonNow();
    const diff = getLuxonDiffToNow(now, 'days');
    expect(typeof diff).toBe('number');
  });
});
