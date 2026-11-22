import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  DutiesAttendanceDayRecords,
  DutiesAttendanceDuties,
} from 'meteor/idreesia-common/server/collections/duties-attendance';
import { MehfilTemplateDuties } from 'meteor/idreesia-common/server/collections/admin';
import { createMehfilDuty } from 'meteor/idreesia-common/server/business-logic/admin/mehfil-template-duties';

import {
  addDutyMember,
  createDuty,
  getDutyPlanDays,
  setDutyAttendance,
} from './index';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// A location picks its duties from the mehfil template duties.
const createNamedDuty = async (
  locationId: string,
  name: string,
  userId: string
) => {
  const existing = await MehfilTemplateDuties.findOneAsync({ name });
  const mehfilDutyId =
    existing?._id ?? (await createMehfilDuty({ name }, userId))._id;
  return createDuty(locationId, { mehfilDutyId }, userId);
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2024-01-07T10:00:00Z'));
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('transactions', () => {
  it("leaves the days unlocked when a roster change fails after locking them", async () => {
    await People.insertAsync({
      _id: 'k1',
      isKarkun: true,
      sharedData: { name: 'Zaid' },
    } as any);
    const locationId = (await OrgLocations.insertAsync({
      name: 'Mehfil',
      type: 'mehfil',
    } as never)) as string;
    const duty = await createNamedDuty(locationId, 'Gate', 'u1');
    await addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1');
    vi.setSystemTime(new Date('2024-01-10T10:00:00Z'));
    await People.insertAsync({
      _id: 'k2',
      isKarkun: true,
      sharedData: { name: 'Ali' },
    } as any);
    // The change locks Jan 8-10 first; its last write then fails.
    vi.spyOn(DutiesAttendanceDuties, 'updateAsync').mockRejectedValueOnce(
      new Error('boom')
    );

    await expect(
      addDutyMember(locationId, duty._id, { karkunId: 'k2' }, 'u1')
    ).rejects.toThrow('boom');

    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: duty._id }).countAsync()
    ).toBe(0);
    expect(
      (await DutiesAttendanceDuties.findOneAsync(duty._id))?.members
    ).toEqual([{ karkunId: 'k1' }]);
  });

  it('leaves no record behind when marking attendance fails', async () => {
    await People.insertAsync({
      _id: 'k1',
      isKarkun: true,
      sharedData: { name: 'Zaid' },
    } as any);
    const locationId = (await OrgLocations.insertAsync({
      name: 'Mehfil',
      type: 'mehfil',
    } as never)) as string;
    const duty = await createNamedDuty(locationId, 'Gate', 'u1');
    await addDutyMember(locationId, duty._id, { karkunId: 'k1' }, 'u1');
    vi.setSystemTime(new Date('2024-01-10T10:00:00Z'));
    vi.spyOn(DutiesAttendanceDayRecords, 'updateAsync').mockRejectedValueOnce(
      new Error('boom')
    );

    await expect(
      setDutyAttendance({
        canMarkAnyone: true,
        locationId,
        dutyId: duty._id,
        date: '2024-01-10',
        karkunId: 'k1',
        status: 'present',
        userId: 'u1',
      })
    ).rejects.toThrow('boom');

    // The days that were locked for the mark are gone with it.
    expect(
      await DutiesAttendanceDayRecords.find({ dutyId: duty._id }).countAsync()
    ).toBe(0);
    // They are written again on the next read, without the mark.
    const { days } = await getDutyPlanDays({
      locationId,
      dutyId: duty._id,
      startDate: '2024-01-10',
    });
    expect(days[0].karkuns[0].attendance).toBeNull();
  });
});
