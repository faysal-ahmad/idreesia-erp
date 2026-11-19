import { describe, expect, it } from 'vitest';

import {
  addCalendarDays,
  datesMatchingWeekday,
  dayOfWeek,
  formatKarachiDate,
  isCalendarDate,
  isDayOfWeek,
  todayInKarachi,
} from './duty-planning-dates';

describe('isCalendarDate', () => {
  it.each([
    ['2024-02-29', true],
    ['2023-02-29', false],
    ['2024-13-01', false],
    ['2024-00-10', false],
    ['2024-04-31', false],
    ['2024-1-01', false],
    ['24-01-01', false],
    ['2024-01-01T00:00', false],
    ['', false],
    [null, false],
    [20240101, false],
  ])('%s -> %s', (value, expected) => {
    expect(isCalendarDate(value)).toBe(expected);
  });
});

describe('isDayOfWeek', () => {
  it.each([
    ['Sat', true],
    ['Fri', true],
    ['sat', false],
    ['Saturday', false],
    [undefined, false],
  ])('%s -> %s', (value, expected) => {
    expect(isDayOfWeek(value)).toBe(expected);
  });
});

describe('Karachi dates', () => {
  it('uses the Karachi calendar day, not UTC', () => {
    // 20:00 UTC is already the next day in Karachi (UTC+5).
    expect(formatKarachiDate(new Date('2024-01-10T20:00:00Z'))).toBe('2024-01-11');
    expect(formatKarachiDate(new Date('2024-01-10T18:59:00Z'))).toBe('2024-01-10');
    expect(todayInKarachi(new Date('2024-12-31T19:00:00Z'))).toBe('2025-01-01');
  });

  it.each([
    ['2024-01-31', 1, '2024-02-01'],
    ['2024-02-28', 1, '2024-02-29'],
    ['2023-02-28', 1, '2023-03-01'],
    ['2024-12-31', 1, '2025-01-01'],
    ['2024-01-01', -1, '2023-12-31'],
    ['2024-03-01', 0, '2024-03-01'],
    ['2024-01-01', 366, '2025-01-01'],
  ])('addCalendarDays(%s, %i) = %s', (date, days, expected) => {
    expect(addCalendarDays(date, days)).toBe(expected);
  });

  it.each([
    ['2024-01-06', 'Sat'],
    ['2024-01-07', 'Sun'],
    ['2024-01-08', 'Mon'],
    ['2024-01-10', 'Wed'],
    ['2024-01-12', 'Fri'],
    ['2024-02-29', 'Thu'],
  ])('dayOfWeek(%s) = %s', (date, expected) => {
    expect(dayOfWeek(date)).toBe(expected);
  });
});

describe('datesMatchingWeekday', () => {
  it('lists every matching weekday in the range, inclusive', () => {
    expect(datesMatchingWeekday('2024-01-01', '2024-01-31', 'Mon')).toEqual([
      '2024-01-01',
      '2024-01-08',
      '2024-01-15',
      '2024-01-22',
      '2024-01-29',
    ]);
    expect(datesMatchingWeekday('2024-01-06', '2024-01-06', 'Sat')).toEqual([
      '2024-01-06',
    ]);
  });

  it('starts at the first match after the start date and crosses months', () => {
    expect(datesMatchingWeekday('2024-01-30', '2024-02-20', 'Fri')).toEqual([
      '2024-02-02',
      '2024-02-09',
      '2024-02-16',
    ]);
  });

  it('returns nothing for an inverted range or a range without a match', () => {
    expect(datesMatchingWeekday('2024-01-10', '2024-01-01', 'Mon')).toEqual([]);
    expect(datesMatchingWeekday('2024-01-08', '2024-01-10', 'Fri')).toEqual([]);
  });
});
