import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DutyDayAttendances, DutyShifts } from 'meteor/idreesia-common/server/collections/hr';

import {
  attendanceFromCheckIn,
  markAttendanceFromCheckIns,
} from './duty-check-in-attendance';
import { checkInKarkun, checkOutKarkun } from './attendance-kiosk';

// Face matching needs OpenCV, which only exists inside Meteor.
vi.mock('../common/find-karkun-by-face-image', () => ({}));

const user = { _id: 'system' };
// Karachi is UTC+5: a 06:00 shift starts at 01:00Z.
const SHIFT_START = new Date('2024-01-09T01:00:00Z');
const at = (iso: string) => new Date(iso);

afterEach(() => {
  vi.useRealTimers();
});

describe('attendanceFromCheckIn', () => {
  it('is absent without a check in', () => {
    expect(attendanceFromCheckIn(null, SHIFT_START)).toBe('absent');
  });

  it('is present up to 15 minutes after the start, and for early check ins', () => {
    expect(attendanceFromCheckIn(at('2024-01-09T00:30:00Z'), SHIFT_START)).toBe('present');
    expect(attendanceFromCheckIn(at('2024-01-09T01:15:00Z'), SHIFT_START)).toBe('present');
  });

  it('is late after the grace period', () => {
    expect(attendanceFromCheckIn(at('2024-01-09T01:16:00Z'), SHIFT_START)).toBe('late');
  });
});

describe('markAttendanceFromCheckIns', () => {
  beforeEach(async () => {
    await DutyShifts.insertAsync({
      _id: 'sh1',
      dutyId: 'd1',
      name: 'Morning',
      startTime: '2024-01-01T01:00:00Z',
    } as any);
    await DutyShifts.insertAsync({ _id: 'sh2', dutyId: 'd1', name: 'Open' } as any);
    await DutyDayAttendances.insertAsync({
      dutyId: 'd1',
      locationId: 'l1',
      shiftId: 'sh1',
      shiftName: 'Morning',
      date: '2024-01-09',
      karkuns: [
        { karkunId: 'on-time', name: 'A', addedForDay: false, checkInAt: at('2024-01-09T01:10:00Z') },
        { karkunId: 'late', name: 'B', addedForDay: false, checkInAt: at('2024-01-09T01:30:00Z') },
        { karkunId: 'missing', name: 'C', addedForDay: false },
        {
          karkunId: 'manual',
          name: 'D',
          addedForDay: false,
          attendance: 'present',
          attendanceUpdatedBy: 'hr',
        },
      ],
    } as any);
    await DutyDayAttendances.insertAsync({
      dutyId: 'd1',
      locationId: 'l1',
      shiftId: 'sh2',
      shiftName: 'Open',
      date: '2024-01-09',
      karkuns: [
        { karkunId: 'in', name: 'E', addedForDay: false, checkInAt: at('2024-01-09T05:00:00Z') },
        { karkunId: 'out', name: 'F', addedForDay: false },
      ],
    } as any);
  });

  const statuses = async (shiftId: string) => {
    const record = (await DutyDayAttendances.findOneAsync({ shiftId })) as any;
    return Object.fromEntries(
      record.karkuns.map((k: any) => [k.karkunId, k.attendance ?? null])
    );
  };

  it('marks the given day from check in times and leaves manual marks alone', async () => {
    const marked = await markAttendanceFromCheckIns(user, '2024-01-09');

    expect(await statuses('sh1')).toEqual({
      'on-time': 'present',
      late: 'late',
      missing: 'absent',
      manual: 'present',
    });
    // 3 on the timed shift + 1 checked in on the shift without a start time.
    expect(marked).toBe(4);
  });

  it('cannot judge a shift with no start time, so only check ins are marked', async () => {
    await markAttendanceFromCheckIns(user, '2024-01-09');

    expect(await statuses('sh2')).toEqual({ in: 'present', out: null });
  });

  it('stamps who marked it, and is safe to repeat', async () => {
    await markAttendanceFromCheckIns(user, '2024-01-09');
    expect(await markAttendanceFromCheckIns(user, '2024-01-09')).toBe(0);

    const record = (await DutyDayAttendances.findOneAsync({ shiftId: 'sh1' })) as any;
    expect(record.karkuns[2].attendanceUpdatedBy).toBe('system');
    expect(record.karkuns[3].attendanceUpdatedBy).toBe('hr');
  });
});

describe('check in and check out', () => {
  const NOW = new Date('2024-01-10T04:00:00Z'); // 09:00 Karachi

  beforeEach(async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
    // 06:00-08:00 (already over), 10:00-12:00 and 14:00-16:00 Karachi.
    const shift = (id: string, start: string, end: string) =>
      DutyShifts.insertAsync({
        _id: id,
        dutyId: 'd1',
        name: id,
        startTime: `2024-01-01T${start}:00Z`,
        endTime: `2024-01-01T${end}:00Z`,
      } as any);
    await shift('early', '01:00', '03:00');
    await shift('mid', '05:00', '07:00');
    await shift('late', '09:00', '11:00');
    await Promise.all(
      ['early', 'mid', 'late'].map(shiftId =>
        DutyDayAttendances.insertAsync({
          dutyId: 'd1',
          locationId: 'l1',
          shiftId,
          shiftName: shiftId,
          date: '2024-01-10',
          karkuns: [{ karkunId: 'k1', name: 'Zaid', addedForDay: false }],
        } as any)
      )
    );
  });

  it('checks in to the first duty that has not ended, then the next', async () => {
    await checkInKarkun('k1');
    let mid = (await DutyDayAttendances.findOneAsync({ shiftId: 'mid' })) as any;
    expect(mid.karkuns[0].checkInAt).toEqual(NOW);

    await checkInKarkun('k1');
    const late = (await DutyDayAttendances.findOneAsync({ shiftId: 'late' })) as any;
    expect(late.karkuns[0].checkInAt).toEqual(NOW);

    await expect(checkInKarkun('k1')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
    mid = (await DutyDayAttendances.findOneAsync({ shiftId: 'early' })) as any;
    expect(mid.karkuns[0].checkInAt).toBeUndefined();
  });

  it('checks out of the most recent check in, once', async () => {
    await expect(checkOutKarkun('k1')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });

    await checkInKarkun('k1');
    vi.setSystemTime(new Date('2024-01-10T05:00:00Z'));
    await checkOutKarkun('k1');

    const mid = (await DutyDayAttendances.findOneAsync({ shiftId: 'mid' })) as any;
    expect(mid.karkuns[0].checkOutAt).toEqual(new Date('2024-01-10T05:00:00Z'));
    await expect(checkOutKarkun('k1')).rejects.toMatchObject({
      extensions: { code: 'NOT_FOUND' },
    });
  });
});
