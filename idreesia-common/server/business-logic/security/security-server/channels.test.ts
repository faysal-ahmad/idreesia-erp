import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  SecurityServerAlerts,
  SecurityServerChannels,
} from 'meteor/idreesia-common/server/collections/security';

import {
  createSecurityServerChannel,
  deleteSecurityServerChannel,
  updateSecurityServerChannel,
} from './channels';
import type { ChannelValues } from './types';

const user = { _id: 'u1' };

const values = (overrides: Partial<ChannelValues> = {}): ChannelValues => ({
  name: '  Gate  ',
  enabled: true,
  recognitionFps: 5,
  connection: { host: ' cam.local ', port: 554, path: ' /live ', username: ' bob ', password: 'pw' },
  ...overrides,
});

const get = (id: string) => SecurityServerChannels.findOneAsync(id) as Promise<any>;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createSecurityServerChannel', () => {
  it('trims text and stores the audit fields', async () => {
    const id = await createSecurityServerChannel(user, values());
    expect(await get(id)).toMatchObject({
      name: 'Gate',
      enabled: true,
      recognitionFps: 5,
      connection: { host: 'cam.local', port: 554, path: '/live', username: 'bob', password: 'pw' },
      createdBy: 'u1',
      updatedBy: 'u1',
    });
  });

  it('drops blank optional values instead of storing empty strings', async () => {
    const id = await createSecurityServerChannel(
      user,
      values({
        connection: { host: 'cam', port: null, path: '  ', username: '', password: '' },
      })
    );
    const channel = await get(id);
    expect(channel.connection).toEqual({ host: 'cam' });
    expect(channel).not.toHaveProperty('similarityThreshold');
    expect(channel).not.toHaveProperty('minFaceSizePx');
    expect(channel).not.toHaveProperty('minFaceQuality');
  });

  it('keeps optional thresholds, including a zero that switches a check off', async () => {
    const id = await createSecurityServerChannel(
      user,
      values({ similarityThreshold: 0.4, minFaceSizePx: 0, minFaceQuality: 30 })
    );
    expect(await get(id)).toMatchObject({
      similarityThreshold: 0.4,
      minFaceSizePx: 0,
      minFaceQuality: 30,
    });
  });
});

describe('updateSecurityServerChannel', () => {
  it('updates the values and unsets optional ones that are now null', async () => {
    const id = await createSecurityServerChannel(
      user,
      values({ similarityThreshold: 0.4, minFaceSizePx: 20, minFaceQuality: 30 })
    );
    await updateSecurityServerChannel({ _id: 'u2' }, id, values({ name: 'Door', enabled: false }));
    const channel = await get(id);
    expect(channel).toMatchObject({ name: 'Door', enabled: false, updatedBy: 'u2' });
    expect(channel).not.toHaveProperty('similarityThreshold');
    expect(channel).not.toHaveProperty('minFaceSizePx');
    expect(channel).not.toHaveProperty('minFaceQuality');
  });

  it('keeps the stored password when the new one is empty', async () => {
    const id = await createSecurityServerChannel(user, values());
    const withoutPassword = values();
    withoutPassword.connection.password = '';
    await updateSecurityServerChannel(user, id, withoutPassword);
    expect((await get(id)).connection.password).toBe('pw');

    withoutPassword.connection.password = 'new';
    await updateSecurityServerChannel(user, id, withoutPassword);
    expect((await get(id)).connection.password).toBe('new');
  });

  it('renames the channel on its alerts, but only when the name changed', async () => {
    const id = await createSecurityServerChannel(user, values());
    await (SecurityServerAlerts.rawCollection() as any).insertMany([
      { _id: 'a1', channelId: id, channelName: 'Gate' },
      { _id: 'a2', channelId: 'other', channelName: 'Other' },
    ] as any);

    await updateSecurityServerChannel(user, id, values({ name: 'Main Gate' }));
    expect((await SecurityServerAlerts.findOneAsync('a1'))?.channelName).toBe('Main Gate');
    expect((await SecurityServerAlerts.findOneAsync('a2'))?.channelName).toBe('Other');

    const updateAlerts = vi.spyOn(SecurityServerAlerts, 'updateAsync');
    await updateSecurityServerChannel(user, id, values({ name: 'Main Gate', enabled: false }));
    expect(updateAlerts).not.toHaveBeenCalled();
  });

  it('rolls the channel back when its alerts cannot be renamed', async () => {
    const id = await createSecurityServerChannel(user, values());
    vi.spyOn(SecurityServerAlerts, 'updateAsync').mockRejectedValueOnce(new Error('db down'));
    await expect(
      updateSecurityServerChannel(user, id, values({ name: 'Renamed' }))
    ).rejects.toThrow('db down');
    expect((await get(id)).name).toBe('Gate');
  });

  it('rejects an unknown or deleted channel', async () => {
    await expect(updateSecurityServerChannel(user, 'nope', values())).rejects.toThrow(
      'Channel not found.'
    );
    const id = await createSecurityServerChannel(user, values());
    await deleteSecurityServerChannel(user, id);
    await expect(updateSecurityServerChannel(user, id, values())).rejects.toThrow(
      'Channel not found.'
    );
  });
});

describe('deleteSecurityServerChannel', () => {
  it('soft-deletes the channel and keeps its alerts', async () => {
    const id = await createSecurityServerChannel(user, values());
    await (SecurityServerAlerts.rawCollection() as any).insertOne({ _id: 'a1', channelId: id } as any);
    await deleteSecurityServerChannel({ _id: 'u2' }, id);
    expect(await get(id)).toMatchObject({ deletedBy: 'u2', updatedBy: 'u2' });
    expect((await get(id)).deletedAt).toBeInstanceOf(Date);
    expect(await SecurityServerAlerts.findOneAsync('a1')).toBeDefined();
  });

  it('rejects an unknown or already deleted channel', async () => {
    await expect(deleteSecurityServerChannel(user, 'nope')).rejects.toThrow('Channel not found.');
    const id = await createSecurityServerChannel(user, values());
    await deleteSecurityServerChannel(user, id);
    await expect(deleteSecurityServerChannel(user, id)).rejects.toThrow('Channel not found.');
  });
});
