import { describe, expect, it } from 'vitest';

import { PeopleTags } from 'meteor/idreesia-common/server/collections/admin';

import { createPeopleTag, removePeopleTag, updatePeopleTag } from './people-tags';

const user = { _id: 'u1' };
const values = {
  name: 'VIP',
  color: '#fff',
  textColor: '#000',
  moduleNames: ['hr'],
};

describe('createPeopleTag', () => {
  it('stamps the creator and returns the tag', async () => {
    const tag = await createPeopleTag(values, user);
    expect(tag).toMatchObject({ ...values, createdBy: 'u1', updatedBy: 'u1' });
  });

  it('rejects a name that is already in use', async () => {
    await createPeopleTag(values, user);
    await expect(createPeopleTag(values, user)).rejects.toThrow(
      "People Tag name 'VIP' is already in use."
    );
    expect(await PeopleTags.find().countAsync()).toBe(1);
  });
});

describe('updatePeopleTag', () => {
  it('saves the new values and stamps the updater', async () => {
    const tag = await createPeopleTag(values, user);
    const updated = await updatePeopleTag(
      { ...values, _id: tag!._id!, name: 'Renamed', moduleNames: ['security'] },
      { _id: 'u2' }
    );
    expect(updated).toMatchObject({
      name: 'Renamed',
      moduleNames: ['security'],
      createdBy: 'u1',
      updatedBy: 'u2',
    });
  });
});

describe('removePeopleTag', () => {
  it('deletes the tag', async () => {
    const tag = await createPeopleTag(values, user);
    await removePeopleTag({ _id: tag!._id! });
    expect(await PeopleTags.findOneAsync(tag!._id!)).toBeUndefined();
  });
});
