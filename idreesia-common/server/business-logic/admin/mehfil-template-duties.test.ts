import { describe, expect, it, vi } from 'vitest';

import {
  MehfilTemplateDuties,
  OrgLocations,
} from 'meteor/idreesia-common/server/collections/admin';
import { createDuty, getDutyNames } from 'meteor/idreesia-common/server/business-logic/duties-attendance';

import {
  createMehfilDuty,
  removeMehfilDuty,
  updateMehfilDuty,
} from './mehfil-template-duties';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

const failsWith = (code: string) => ({ extensions: { code } });

const seedLocation = async () =>
  (await OrgLocations.insertAsync({
    name: 'Gulshan Mehfil',
    type: 'mehfil',
  } as never)) as string;

describe('mehfil template duties', () => {
  it('creates a duty, trimming the name and refusing a repeat in any case', async () => {
    const gate = await createMehfilDuty({ name: ' Gate  1 ' }, 'u1');
    expect(gate).toMatchObject({ name: 'Gate 1', createdBy: 'u1' });

    await expect(
      createMehfilDuty({ name: 'gate 1' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));
    await expect(createMehfilDuty({ name: '  ' }, 'u1')).rejects.toMatchObject(
      failsWith('BAD_USER_INPUT')
    );
  });

  it('updates the description, and clears it', async () => {
    const duty = await createMehfilDuty(
      { name: 'Langar', description: 'Cooking' },
      'u1'
    );
    expect(duty.description).toBe('Cooking');

    const cleared = await updateMehfilDuty(duty._id, { description: null }, 'u2');
    expect(cleared.description).toBeUndefined();
    expect(cleared.updatedBy).toBe('u2');
  });

  it('renames the duty for every mehfil that uses it', async () => {
    const duty = await createMehfilDuty({ name: 'Gate' }, 'u1');
    const other = await createMehfilDuty({ name: 'Kitchen' }, 'u1');
    const locationId = await seedLocation();
    const used = await createDuty(locationId, { mehfilDutyId: duty._id }, 'u1');

    await expect(
      updateMehfilDuty(duty._id, { name: 'kitchen' }, 'u1')
    ).rejects.toMatchObject(failsWith('CONFLICT'));

    await updateMehfilDuty(duty._id, { name: 'Main Gate' }, 'u1');
    // The mehfil's duty reads the name from the template, so nothing to update.
    expect(await getDutyNames([used])).toEqual(
      new Map([[used._id, 'Main Gate']])
    );
    expect(other.name).toBe('Kitchen');
  });

  it("can't delete a duty a mehfil uses, but can delete an unused one", async () => {
    const duty = await createMehfilDuty({ name: 'Gate' }, 'u1');
    const spare = await createMehfilDuty({ name: 'Spare' }, 'u1');
    const locationId = await seedLocation();
    await createDuty(locationId, { mehfilDutyId: duty._id }, 'u1');

    await expect(removeMehfilDuty(duty._id)).rejects.toMatchObject(
      failsWith('CONFLICT')
    );
    await removeMehfilDuty(spare._id);
    expect(await MehfilTemplateDuties.findOneAsync(spare._id)).toBeUndefined();
    await expect(removeMehfilDuty(spare._id)).rejects.toMatchObject(
      failsWith('NOT_FOUND')
    );
  });
});
