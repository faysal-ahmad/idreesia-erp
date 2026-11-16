import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  putFile: vi.fn(async () => undefined),
  getFile: vi.fn(),
  deleteFiles: vi.fn(async () => undefined),
}));
vi.mock('meteor/idreesia-common/server/file-storage', async () => ({
  ...(await import('meteor/idreesia-common/server/test-utils/file-storage-mock')),
  ...storage,
}));
vi.mock('sharp', () => {
  const chain: any = {
    resize: () => chain,
    jpeg: () => chain,
    toBuffer: async () => Buffer.from('thumb'),
  };
  return { default: () => chain };
});
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', () => ({
  computeVectorFromImageBuffer: () => ({ status: 'computed' }),
}));

const { SecurityServerChannels, SecurityServerProfiles } = await import(
  'meteor/idreesia-common/server/collections/security'
);
const sync = await import('./sync');
const { createSecurityServerChannel, deleteSecurityServerChannel } = await import('./channels');
const { createSecurityServerProfile, deleteSecurityServerProfile, storeSecurityServerProfileImage } =
  await import('./profiles');

const user = { _id: 'sync-user' };
const channelsDb = SecurityServerChannels as any;
const profilesDb = SecurityServerProfiles as any;

const channelValues = (overrides = {}) => ({
  name: 'Gate',
  enabled: true,
  recognitionFps: 5,
  connection: { host: 'cam', port: 554, path: '/live', username: 'bob', password: 'pw' },
  ...overrides,
});
const pushChannel = (overrides: Record<string, unknown> = {}) =>
  ({ erpId: null, deleted: false, ...channelValues(), ...overrides }) as any;

const pushProfile = (overrides: Record<string, unknown> = {}) =>
  ({ erpId: null, deleted: false, name: 'Ali', isTest: false, images: [], ...overrides }) as any;
const img = (localId: string, extra: Record<string, unknown> = {}) => ({
  localId,
  erpId: null,
  data: Buffer.from(`jpeg-${localId}`),
  ...extra,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('getSecurityServerChanges', () => {
  it('returns every active record when there is no cursor', async () => {
    const channelId = await createSecurityServerChannel(user, channelValues());
    const deletedChannel = await createSecurityServerChannel(user, channelValues({ name: 'Old' }));
    await deleteSecurityServerChannel(user, deletedChannel);
    const profileId = await createSecurityServerProfile(user, { name: 'Ali', isTest: false });
    const deletedProfile = await createSecurityServerProfile(user, { name: 'Gone', isTest: false });
    await deleteSecurityServerProfile(user, deletedProfile);

    const before = Date.now();
    const changes = await sync.getSecurityServerChanges(null);
    expect(changes.serverTime.getTime()).toBeLessThanOrEqual(Date.now());
    expect(changes.serverTime.getTime()).toBeGreaterThanOrEqual(before - 1);
    expect(changes.channels.map(c => c.id)).toEqual([channelId]);
    expect(changes.profiles.map(p => p.id)).toEqual([profileId]);
  });

  it('maps channels, with nulls for unset optional values', async () => {
    const id = await createSecurityServerChannel(
      user,
      channelValues({ connection: { host: 'cam' } })
    );
    const [channel] = (await sync.getSecurityServerChanges(null)).channels;
    expect(channel).toEqual({
      id,
      externalId: null,
      deleted: false,
      name: 'Gate',
      enabled: true,
      similarityThreshold: null,
      recognitionFps: 5,
      minFaceSizePx: null,
      minFaceQuality: null,
      connection: { host: 'cam', port: null, path: null, username: null, password: null },
    });
  });

  it('maps profiles with their photo ids and chosen default', async () => {
    const id = await createSecurityServerProfile(user, { name: 'Ali', isTest: true });
    const imageId = await storeSecurityServerProfileImage(user, id, Buffer.from('x'), 'ext-1');
    await profilesDb.updateAsync(id, { $set: { defaultImageId: imageId, externalId: 'ext-p' } });
    const [profile] = (await sync.getSecurityServerChanges(null)).profiles;
    expect(profile).toEqual({
      id,
      externalId: 'ext-p',
      deleted: false,
      name: 'Ali',
      isTest: true,
      images: [{ id: imageId, externalId: 'ext-1' }],
      defaultImageId: imageId,
    });
  });

  it('reports a profile with no chosen default photo as null', async () => {
    await createSecurityServerProfile(user, { name: 'Ali', isTest: true });
    expect((await sync.getSecurityServerChanges(null)).profiles[0]).toMatchObject({
      defaultImageId: null,
      images: [],
    });
  });

  it('returns changes since the cursor (inclusive), deletions as bare tombstones', async () => {
    const oldChannel = await createSecurityServerChannel(user, channelValues({ name: 'Old' }));
    await channelsDb.updateAsync(oldChannel, { $set: { updatedAt: new Date('2020-01-01') } });
    const changed = await createSecurityServerChannel(user, channelValues({ name: 'New' }));
    await channelsDb.updateAsync(changed, { $set: { externalId: 'ext-c', updatedAt: new Date('2024-06-01') } });
    const deleted = await createSecurityServerProfile(user, { name: 'Gone', isTest: false });
    await profilesDb.updateAsync(deleted, { $set: { externalId: 'ext-p', updatedAt: new Date('2024-06-02') } });
    await deleteSecurityServerProfile(user, deleted);

    const changes = await sync.getSecurityServerChanges(new Date('2024-06-01'));
    expect(changes.channels.map(c => c.id)).toEqual([changed]);
    expect(changes.profiles).toEqual([{ id: deleted, externalId: 'ext-p', deleted: true }]);

    const exact = await sync.getSecurityServerChanges((await channelsDb.findOneAsync(changed)).updatedAt);
    expect(exact.channels.map(c => c.id)).toEqual([changed]);
  });

  it('includes deleted records when a cursor is given, so deletions reach the other side', async () => {
    const id = await createSecurityServerChannel(user, channelValues());
    await deleteSecurityServerChannel(user, id);
    const { channels } = await sync.getSecurityServerChanges(new Date(Date.now() - 60_000));
    expect(channels).toEqual([{ id, externalId: null, deleted: true }]);
  });
});

describe('getSecurityServerProfileImage', () => {
  it('returns the stored photo bytes', async () => {
    const id = await createSecurityServerProfile(user, { name: 'Ali', isTest: false });
    const imageId = await storeSecurityServerProfileImage(user, id, Buffer.from('x'));
    storage.getFile.mockResolvedValue({ body: Buffer.from('bytes') });
    expect(await sync.getSecurityServerProfileImage(id, imageId)).toEqual(Buffer.from('bytes'));
    const [key] = storage.getFile.mock.calls[0] as unknown as [string];
    expect(key).toContain(imageId);
  });

  it('answers 404 for an unknown photo, an unknown profile or a deleted profile', async () => {
    const id = await createSecurityServerProfile(user, { name: 'Ali', isTest: false });
    const imageId = await storeSecurityServerProfileImage(user, id, Buffer.from('x'));
    await expect(sync.getSecurityServerProfileImage(id, 'nope')).rejects.toMatchObject({
      statusCode: 404,
    });
    await expect(sync.getSecurityServerProfileImage('nope', imageId)).rejects.toMatchObject({
      statusCode: 404,
    });
    await deleteSecurityServerProfile(user, id);
    await expect(sync.getSecurityServerProfileImage(id, imageId)).rejects.toMatchObject({
      statusCode: 404,
    });
  });
});

describe('upsertSecurityServerChannelFromSync', () => {
  const upsert = (localId: string, push = pushChannel()) =>
    sync.upsertSecurityServerChannelFromSync(user, localId, push);

  it('creates an unknown channel and links the security server id', async () => {
    const id = await upsert('ext-1');
    expect(await channelsDb.findOneAsync(id)).toMatchObject({
      name: 'Gate',
      externalId: 'ext-1',
      createdBy: 'sync-user',
    });
  });

  it('is idempotent: a repeated push finds the same channel and changes nothing', async () => {
    const id = await upsert('ext-1');
    const updatedAt = (await channelsDb.findOneAsync(id)).updatedAt;
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    expect(await upsert('ext-1')).toBe(id);
    expect(await channelsDb.find({}).countAsync()).toBe(1);
    expect((await channelsDb.findOneAsync(id)).updatedAt).toEqual(updatedAt);
  });

  it('links an ERP-created channel the first time the security server sends it back', async () => {
    const erpId = await createSecurityServerChannel(user, channelValues());
    expect(await upsert('ext-1', pushChannel({ erpId }))).toBe(erpId);
    expect((await channelsDb.findOneAsync(erpId)).externalId).toBe('ext-1');
    expect(await channelsDb.find({}).countAsync()).toBe(1);
  });

  it('applies a changed value and trims names before comparing', async () => {
    const id = await upsert('ext-1');
    await upsert('ext-1', pushChannel({ name: ' Gate ' }));
    expect((await channelsDb.findOneAsync(id)).updatedBy).toBe('sync-user');
    const stamp = (await channelsDb.findOneAsync(id)).updatedAt;
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });

    // Trim-equal and blank-vs-missing values do not count as a change.
    await upsert(
      'ext-1',
      pushChannel({
        name: ' Gate ',
        connection: { host: ' cam ', port: 554, path: '/live', username: 'bob', password: '' },
      })
    );
    expect((await channelsDb.findOneAsync(id)).updatedAt).toEqual(stamp);

    await upsert('ext-1', pushChannel({ enabled: false, minFaceQuality: 40 }));
    expect(await channelsDb.findOneAsync(id)).toMatchObject({ enabled: false, minFaceQuality: 40 });
    expect((await channelsDb.findOneAsync(id)).updatedAt.getTime()).toBeGreaterThan(stamp.getTime());
  });

  it('keeps the stored password when the push carries none, replaces it when it differs', async () => {
    const id = await upsert('ext-1');
    await upsert('ext-1', pushChannel({ name: 'Renamed', connection: { host: 'cam', port: 554, path: '/live', username: 'bob', password: null } }));
    expect((await channelsDb.findOneAsync(id)).connection.password).toBe('pw');
    await upsert('ext-1', pushChannel({ connection: { host: 'cam', port: 554, path: '/live', username: 'bob', password: 'new' } }));
    expect((await channelsDb.findOneAsync(id)).connection.password).toBe('new');
  });

  it('clears an optional threshold the security server no longer sets', async () => {
    const id = await upsert('ext-1', pushChannel({ similarityThreshold: 0.5 }));
    await upsert('ext-1', pushChannel({ similarityThreshold: null }));
    expect(await channelsDb.findOneAsync(id)).not.toHaveProperty('similarityThreshold');
  });

  it('deletes a channel on a pushed delete, and tolerates a repeat or an unknown one', async () => {
    const id = await upsert('ext-1');
    const del = { erpId: null, deleted: true } as any;
    expect(await upsert('ext-1', del)).toBe(id);
    expect((await channelsDb.findOneAsync(id)).deletedAt).toBeInstanceOf(Date);
    expect(await upsert('ext-1', del)).toBe(id);
    expect(await upsert('never-seen', del)).toBeNull();
    expect(await channelsDb.find({}).countAsync()).toBe(1);
  });

  it('restores a channel deleted in the ERP when the security server edits it', async () => {
    const id = await upsert('ext-1');
    await deleteSecurityServerChannel(user, id as string);
    await upsert('ext-1', pushChannel({ name: 'Edited' }));
    const channel = await channelsDb.findOneAsync(id);
    expect(channel).not.toHaveProperty('deletedAt');
    expect(channel).not.toHaveProperty('deletedBy');
    expect(channel.name).toBe('Edited');
  });

  it('leaves nothing behind when the push fails part-way', async () => {
    const spy = vi.spyOn(channelsDb, 'updateAsync').mockRejectedValueOnce(new Error('db down'));
    await expect(upsert('ext-1')).rejects.toThrow('db down');
    spy.mockRestore();
    expect(await channelsDb.find({}).countAsync()).toBe(0);
  });
});

describe('upsertSecurityServerProfileFromSync', () => {
  const upsert = (localId: string, push = pushProfile()) =>
    sync.upsertSecurityServerProfileFromSync(user, localId, push);

  it('creates a profile with the pushed photos and reports their ERP ids', async () => {
    const result = await upsert('ext-p', pushProfile({ images: [img('i1'), img('i2')] }));
    const profile = await profilesDb.findOneAsync(result._id);
    expect(profile).toMatchObject({ name: 'Ali', externalId: 'ext-p' });
    expect(profile.images.map((i: any) => i.externalId)).toEqual(['i1', 'i2']);
    expect(result.images).toEqual([
      { localId: 'i1', _id: profile.images[0]._id },
      { localId: 'i2', _id: profile.images[1]._id },
    ]);
    expect(result.missingImages).toEqual([]);
  });

  it('is idempotent for an unchanged push: no new photos, no change stamp', async () => {
    const first = await upsert('ext-p', pushProfile({ images: [img('i1')] }));
    const stamp = (await profilesDb.findOneAsync(first._id)).updatedAt;
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    storage.putFile.mockClear();

    const second = await upsert('ext-p', pushProfile({ images: [img('i1', { data: null })] }));
    expect(second._id).toBe(first._id);
    expect(second.images).toEqual(first.images);
    expect(storage.putFile).not.toHaveBeenCalled();
    const profile = await profilesDb.findOneAsync(first._id);
    expect(profile.images).toHaveLength(1);
    expect(profile.updatedAt).toEqual(stamp);
  });

  it('asks for the JPEG of a photo it does not have and was sent without data', async () => {
    const result = await upsert('ext-p', pushProfile({ images: [img('i1', { data: null })] }));
    expect(result.missingImages).toEqual(['i1']);
    expect(result.images).toEqual([]);
    expect((await profilesDb.findOneAsync(result._id)).images).toEqual([]);
  });

  it('links a photo the ERP created by its ERP id', async () => {
    const erpProfile = await createSecurityServerProfile(user, { name: 'Ali', isTest: false });
    const erpImage = await storeSecurityServerProfileImage(user, erpProfile, Buffer.from('x'));
    const result = await upsert(
      'ext-p',
      pushProfile({ erpId: erpProfile, images: [img('i1', { erpId: erpImage, data: null })] })
    );
    expect(result._id).toBe(erpProfile);
    expect(result.images).toEqual([{ localId: 'i1', _id: erpImage }]);
    const profile = await profilesDb.findOneAsync(erpProfile);
    expect(profile.externalId).toBe('ext-p');
    expect(profile.images[0].externalId).toBe('i1');
  });

  it('removes photos the security server no longer has', async () => {
    const first = await upsert('ext-p', pushProfile({ images: [img('i1'), img('i2')] }));
    const removed = first.images[0]._id;
    await upsert('ext-p', pushProfile({ images: [img('i2', { data: null })] }));
    const profile = await profilesDb.findOneAsync(first._id);
    expect(profile.images.map((i: any) => i.externalId)).toEqual(['i2']);
    expect(storage.deleteFiles).toHaveBeenCalledWith(
      expect.arrayContaining([expect.stringContaining(removed)])
    );
  });

  it('renames the profile only when its name or test flag changed', async () => {
    const { _id } = await upsert('ext-p');
    const stamp = (await profilesDb.findOneAsync(_id)).updatedAt;
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await upsert('ext-p', pushProfile({ name: ' Ali ' }));
    expect((await profilesDb.findOneAsync(_id)).updatedAt).toEqual(stamp);

    await upsert('ext-p', pushProfile({ name: 'Ali Khan', isTest: true }));
    expect(await profilesDb.findOneAsync(_id)).toMatchObject({ name: 'Ali Khan', isTest: true });
  });

  it('applies the pushed default photo, and only once the photo is known', async () => {
    const first = await upsert('ext-p', pushProfile({ images: [img('i1'), img('i2')], defaultImageId: 'i2' }));
    const second = first.images[1]._id;
    expect((await profilesDb.findOneAsync(first._id)).defaultImageId).toBe(second);

    // A default naming a photo the ERP lacks leaves the choice unchanged.
    await upsert(
      'ext-p',
      pushProfile({ images: [img('i1', { data: null }), img('i2', { data: null }), img('i3', { data: null })], defaultImageId: 'i3' })
    );
    expect((await profilesDb.findOneAsync(first._id)).defaultImageId).toBe(second);
  });

  it('clears the default on null, keeps the ERP choice when the field is absent', async () => {
    const first = await upsert('ext-p', pushProfile({ images: [img('i1')], defaultImageId: 'i1' }));
    const keep = pushProfile({ images: [img('i1', { data: null })] });
    await upsert('ext-p', keep);
    expect((await profilesDb.findOneAsync(first._id)).defaultImageId).toBeDefined();

    await upsert('ext-p', pushProfile({ images: [img('i1', { data: null })], defaultImageId: null }));
    expect(await profilesDb.findOneAsync(first._id)).not.toHaveProperty('defaultImageId');
  });

  it('does not stamp updatedAt when only the default photo changes', async () => {
    const first = await upsert('ext-p', pushProfile({ images: [img('i1'), img('i2')] }));
    const stamp = (await profilesDb.findOneAsync(first._id)).updatedAt;
    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await upsert(
      'ext-p',
      pushProfile({ images: [img('i1', { data: null }), img('i2', { data: null })], defaultImageId: 'i2' })
    );
    expect((await profilesDb.findOneAsync(first._id)).updatedAt).toEqual(stamp);
  });

  it('deletes on a pushed delete, tolerating a repeat or an unknown profile', async () => {
    const { _id } = await upsert('ext-p', pushProfile({ images: [img('i1')] }));
    const del = { erpId: null, deleted: true } as any;
    expect(await upsert('ext-p', del)).toEqual({ _id, images: [], missingImages: [] });
    expect(await upsert('ext-p', del)).toEqual({ _id, images: [], missingImages: [] });
    expect(await upsert('never-seen', del)).toEqual({ _id: null, images: [], missingImages: [] });
    expect((await profilesDb.findOneAsync(_id)).images).toEqual([]);
  });

  it('restores a profile deleted in the ERP when the security server pushes it', async () => {
    const { _id } = await upsert('ext-p');
    await deleteSecurityServerProfile(user, _id as string);
    await upsert('ext-p', pushProfile({ name: 'Back' }));
    const profile = await profilesDb.findOneAsync(_id);
    expect(profile).not.toHaveProperty('deletedAt');
    expect(profile.name).toBe('Back');
  });

  it('rolls everything back when storing a photo fails', async () => {
    storage.putFile.mockRejectedValueOnce(new Error('storage down'));
    await expect(upsert('ext-p', pushProfile({ images: [img('i1')] }))).rejects.toThrow(
      'storage down'
    );
    expect(await profilesDb.find({}).countAsync()).toBe(0);
  });
});
