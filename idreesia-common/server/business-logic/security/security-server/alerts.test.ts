import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  putFile: vi.fn(async () => undefined),
  getFile: vi.fn(),
}));
vi.mock('meteor/idreesia-common/server/file-storage', async () => ({
  ...(await import('meteor/idreesia-common/server/test-utils/file-storage-mock')),
  ...storage,
}));

const sharpState = vi.hoisted(() => ({ fail: false }));
vi.mock('sharp', () => {
  const chain: any = {
    resize: () => chain,
    jpeg: () => chain,
    toBuffer: async () => {
      if (sharpState.fail) throw new Error('bad image');
      return Buffer.from('thumb');
    },
  };
  return { default: () => chain };
});

const {
  SecurityServerAlerts,
  SecurityServerChannels,
  SecurityServerProfiles,
} = await import('meteor/idreesia-common/server/collections/security');
const {
  createMissingSecurityServerAlertThumbnails,
  setSecurityServerAlertReview,
  upsertSecurityServerAlert,
} = await import('./alerts');

const user = { _id: 'u1' };
const timestamp = new Date('2024-03-09T23:30:00Z');

const payload = (overrides: Record<string, unknown> = {}) => ({
  profileId: 'ext-p',
  channelId: 'ext-c',
  timestamp,
  similarityScore: 0.91,
  faceSizePx: null,
  faceQuality: null,
  image: { mimeType: 'image/jpeg', data: Buffer.from('img') },
  ...overrides,
});

beforeEach(async () => {
  vi.clearAllMocks();
  sharpState.fail = false;
  await (SecurityServerProfiles.rawCollection() as any).insertOne({
    _id: 'p1',
    externalId: 'ext-p',
    name: 'Ali',
    isTest: true,
    images: [],
  } as any);
  await (SecurityServerChannels.rawCollection() as any).insertOne({
    _id: 'c1',
    externalId: 'ext-c',
    name: 'Gate',
  } as any);
});

describe('upsertSecurityServerAlert', () => {
  it('stores the alert with a snapshot of the profile and channel names', async () => {
    const id = await upsertSecurityServerAlert(user, 'alert-1', payload());
    expect(await SecurityServerAlerts.findOneAsync(id)).toMatchObject({
      externalId: 'alert-1',
      profileId: 'p1',
      profileName: 'Ali',
      profileIsTest: true,
      channelId: 'c1',
      channelName: 'Gate',
      timestamp,
      similarityScore: 0.91,
      imageKey: 'security-server-alert-images/2024/03/alert-1.jpg',
      thumbnailKey: 'security-server-alert-images/2024/03/alert-1.thumb.jpg',
      createdBy: 'u1',
    });
    expect(storage.putFile).toHaveBeenCalledWith(
      'security-server-alert-images/2024/03/alert-1.jpg',
      Buffer.from('img'),
      'image/jpeg'
    );
  });

  it('partitions the image key by the alert month in UTC', async () => {
    const id = await upsertSecurityServerAlert(
      user,
      'alert-2',
      payload({ timestamp: new Date('2024-12-31T23:59:00Z'), image: { mimeType: 'image/png', data: Buffer.from('x') } })
    );
    expect((await SecurityServerAlerts.findOneAsync(id))?.imageKey).toBe(
      'security-server-alert-images/2024/12/alert-2.png'
    );
  });

  it('stores face quality details only when present', async () => {
    const plain = await upsertSecurityServerAlert(user, 'a-plain', payload());
    const detailed = await upsertSecurityServerAlert(
      user,
      'a-detail',
      payload({ faceSizePx: 80, faceQuality: { score: 55, reasons: ['Face turned away'] } })
    );
    expect(await SecurityServerAlerts.findOneAsync(plain)).not.toHaveProperty('faceSizePx');
    expect(await SecurityServerAlerts.findOneAsync(plain)).not.toHaveProperty('faceQualityScore');
    expect(await SecurityServerAlerts.findOneAsync(detailed)).toMatchObject({
      faceSizePx: 80,
      faceQualityScore: 55,
      faceQualityReasons: ['Face turned away'],
    });
  });

  it('is a no-op for an alert already stored: no re-upload, no duplicate', async () => {
    const first = await upsertSecurityServerAlert(user, 'alert-1', payload());
    storage.putFile.mockClear();
    const again = await upsertSecurityServerAlert(user, 'alert-1', payload({ image: null }));
    expect(again).toBe(first);
    expect(storage.putFile).not.toHaveBeenCalled();
    expect(await SecurityServerAlerts.find({}).countAsync()).toBe(1);
  });

  it('rejects an unknown profile or channel with a 422', async () => {
    await expect(
      upsertSecurityServerAlert(user, 'x', payload({ profileId: 'nope' }))
    ).rejects.toMatchObject({ statusCode: 422, message: "Unknown profile 'nope'." });
    await expect(
      upsertSecurityServerAlert(user, 'x', payload({ channelId: 'nope' }))
    ).rejects.toMatchObject({ statusCode: 422, message: "Unknown channel 'nope'." });
  });

  it('requires the image the first time, and rejects unsupported types', async () => {
    await expect(
      upsertSecurityServerAlert(user, 'x', payload({ image: null }))
    ).rejects.toMatchObject({ statusCode: 422 });
    await expect(
      upsertSecurityServerAlert(
        user,
        'x',
        payload({ image: { mimeType: 'image/gif', data: Buffer.from('x') } })
      )
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(storage.putFile).not.toHaveBeenCalled();
    expect(await SecurityServerAlerts.find({}).countAsync()).toBe(0);
  });

  it('accepts alerts for a profile that was deleted in the ERP', async () => {
    await SecurityServerProfiles.updateAsync('p1', { $set: { deletedAt: new Date() } });
    await expect(upsertSecurityServerAlert(user, 'alert-1', payload())).resolves.toBeTruthy();
  });

  it('stores the alert without a thumbnail when one cannot be made', async () => {
    sharpState.fail = true;
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const id = await upsertSecurityServerAlert(user, 'alert-1', payload());
    expect(await SecurityServerAlerts.findOneAsync(id)).not.toHaveProperty('thumbnailKey');
  });
});

describe('createMissingSecurityServerAlertThumbnails', () => {
  const addAlert = (_id: string, extra: Record<string, unknown> = {}) =>
    (SecurityServerAlerts.rawCollection() as any).insertOne({
      _id,
      imageKey: `folder/${_id}.jpg`,
      ...extra,
    } as any);

  it('makes thumbnails only for alerts without one and counts them', async () => {
    await addAlert('a1');
    await addAlert('a2', { thumbnailKey: 'folder/a2.thumb.jpg' });
    await addAlert('a3');
    storage.getFile.mockResolvedValue({ body: Buffer.from('img') });

    expect(await createMissingSecurityServerAlertThumbnails()).toBe(2);
    expect((await SecurityServerAlerts.findOneAsync('a1'))?.thumbnailKey).toBe(
      'folder/a1.thumb.jpg'
    );
    expect((await SecurityServerAlerts.findOneAsync('a2'))?.thumbnailKey).toBe(
      'folder/a2.thumb.jpg'
    );
  });

  it('skips images that cannot be read and thumbnails that cannot be made', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await addAlert('a1');
    await addAlert('a2');
    storage.getFile.mockRejectedValueOnce(new Error('gone'));
    storage.getFile.mockResolvedValue({ body: Buffer.from('img') });
    sharpState.fail = true;
    expect(await createMissingSecurityServerAlertThumbnails()).toBe(0);
    expect(await SecurityServerAlerts.find({ thumbnailKey: { $exists: true } }).countAsync()).toBe(0);
  });
});

describe('setSecurityServerAlertReview', () => {
  it('records and clears a review', async () => {
    await (SecurityServerAlerts.rawCollection() as any).insertOne({ _id: 'a1' } as any);
    await setSecurityServerAlertReview(user, 'a1', 'FALSE_POSITIVE');
    expect(await SecurityServerAlerts.findOneAsync('a1')).toMatchObject({
      review: 'FALSE_POSITIVE',
      updatedBy: 'u1',
    });
    expect((await SecurityServerAlerts.findOneAsync('a1'))?.reviewedAt).toBeInstanceOf(Date);

    await setSecurityServerAlertReview(user, 'a1', null);
    const cleared = await SecurityServerAlerts.findOneAsync('a1');
    expect(cleared).not.toHaveProperty('review');
    expect(cleared).not.toHaveProperty('reviewedAt');
  });

  it('rejects an unknown alert', async () => {
    await expect(setSecurityServerAlertReview(user, 'nope', 'CORRECT')).rejects.toThrow(
      'Alert not found.'
    );
  });
});
