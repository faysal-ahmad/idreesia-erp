import { beforeEach, describe, expect, it, vi } from 'vitest';

const storage = vi.hoisted(() => ({
  putFile: vi.fn(async (..._args: any[]) => undefined),
  getFile: vi.fn(),
  deleteFiles: vi.fn(async (..._args: any[]) => undefined),
}));
vi.mock('meteor/idreesia-common/server/file-storage', async () => ({
  ...(await import('meteor/idreesia-common/server/test-utils/file-storage-mock')),
  ...storage,
}));

const sharpState = vi.hoisted(() => ({ normalizeFails: false, thumbnailFails: false }));
vi.mock('sharp', () => {
  // The normalising call rotates first; the thumbnail call does not.
  const make = (rotated: boolean) => {
    const chain: any = {
      rotate: () => make(true),
      resize: () => chain,
      jpeg: () => chain,
      toBuffer: async () => {
        if (rotated && sharpState.normalizeFails) throw new Error('not an image');
        if (!rotated && sharpState.thumbnailFails) throw new Error('thumb failed');
        return Buffer.from(rotated ? 'normalized' : 'thumb');
      },
    };
    return chain;
  };
  return { default: () => make(false) };
});

const vector = vi.hoisted(() => ({ status: 'computed' }));
vi.mock('meteor/idreesia-common/server/business-logic/common/compute-image-vector-data', () => ({
  computeVectorFromImageBuffer: () => ({ status: vector.status }),
}));

const { SecurityServerAlerts, SecurityServerProfiles } = await import(
  'meteor/idreesia-common/server/collections/security'
);
const { ProfileImageRejectedError } = await import('./profile-image-rejected-error');
const profiles = await import('./profiles');

const user = { _id: 'u1' };
const get = (id: string) => SecurityServerProfiles.findOneAsync(id) as Promise<any>;

beforeEach(() => {
  vi.clearAllMocks();
  sharpState.normalizeFails = false;
  sharpState.thumbnailFails = false;
  vector.status = 'computed';
});

const newProfile = (name = '  Ali  ', isTest = false) =>
  profiles.createSecurityServerProfile(user, { name, isTest });

describe('createSecurityServerProfile / updateSecurityServerProfile', () => {
  it('creates a profile with a trimmed name and no images', async () => {
    const id = await newProfile();
    expect(await get(id)).toMatchObject({
      name: 'Ali',
      isTest: false,
      images: [],
      createdBy: 'u1',
    });
  });

  it('updates the profile and the name/test flag snapshot on its alerts', async () => {
    const id = await newProfile();
    await (SecurityServerAlerts.rawCollection() as any).insertMany([
      { _id: 'a1', profileId: id, profileName: 'Ali', profileIsTest: false },
      { _id: 'a2', profileId: 'other', profileName: 'Other', profileIsTest: false },
    ] as any);
    await profiles.updateSecurityServerProfile({ _id: 'u2' }, id, { name: ' Bilal ', isTest: true });

    expect(await get(id)).toMatchObject({ name: 'Bilal', isTest: true, updatedBy: 'u2' });
    expect(await SecurityServerAlerts.findOneAsync('a1')).toMatchObject({
      profileName: 'Bilal',
      profileIsTest: true,
    });
    expect(await SecurityServerAlerts.findOneAsync('a2')).toMatchObject({ profileName: 'Other' });
  });

  it('leaves the alerts alone when nothing visible changed', async () => {
    const id = await newProfile();
    const spy = vi.spyOn(SecurityServerAlerts, 'updateAsync');
    await profiles.updateSecurityServerProfile(user, id, { name: 'Ali ', isTest: false });
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('rolls back the profile when its alerts cannot be updated', async () => {
    const id = await newProfile();
    const spy = vi
      .spyOn(SecurityServerAlerts, 'updateAsync')
      .mockRejectedValueOnce(new Error('db down'));
    await expect(
      profiles.updateSecurityServerProfile(user, id, { name: 'New', isTest: false })
    ).rejects.toThrow('db down');
    expect((await get(id)).name).toBe('Ali');
    spy.mockRestore();
  });

  it('rejects an unknown or deleted profile', async () => {
    await expect(
      profiles.updateSecurityServerProfile(user, 'nope', { name: 'x', isTest: false })
    ).rejects.toThrow('Profile not found.');
  });
});

describe('storeSecurityServerProfileImage', () => {
  it('stores the photo and its thumbnail and links them to the profile', async () => {
    const id = await newProfile();
    const imageId = await profiles.storeSecurityServerProfileImage(
      user,
      id,
      Buffer.from('jpeg'),
      'ext-img'
    );
    const [image] = (await get(id)).images;
    expect(image).toMatchObject({
      _id: imageId,
      externalId: 'ext-img',
      imageKey: `security-server-profile-images/${id}/${imageId}.jpg`,
      thumbnailKey: `security-server-profile-images/${id}/${imageId}.thumb.jpg`,
      uploadedBy: 'u1',
    });
    expect(storage.putFile).toHaveBeenCalledTimes(2);
  });

  it('stores the photo without a thumbnail when one cannot be made', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    sharpState.thumbnailFails = true;
    const id = await newProfile();
    await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('jpeg'));
    const [image] = (await get(id)).images;
    expect(image).not.toHaveProperty('thumbnailKey');
    expect(image).not.toHaveProperty('externalId');
  });

  it('deletes the stored files again when the transaction rolls back', async () => {
    const id = await newProfile();
    const spy = vi
      .spyOn(SecurityServerProfiles, 'updateAsync')
      .mockRejectedValueOnce(new Error('db down'));
    await expect(
      profiles.storeSecurityServerProfileImage(user, id, Buffer.from('jpeg'))
    ).rejects.toThrow('db down');
    spy.mockRestore();
    expect((await get(id)).images).toEqual([]);
    expect(storage.deleteFiles).toHaveBeenCalledTimes(1);
    const keys = storage.deleteFiles.mock.calls[0][0] as string[];
    expect(keys).toHaveLength(2);
    expect(keys[0]).toMatch(/\.jpg$/);
    expect(keys[1]).toMatch(/\.thumb\.jpg$/);
  });
});

describe('addSecurityServerProfileImage', () => {
  const upload = { mimeType: 'image/png', data: Buffer.from('raw') };

  it('stores the normalised JPEG when the face check passes', async () => {
    const id = await newProfile();
    await profiles.addSecurityServerProfileImage(user, id, upload);
    expect((await get(id)).images).toHaveLength(1);
    expect(storage.putFile.mock.calls[0][1]).toEqual(Buffer.from('normalized'));
  });

  it.each([
    ['no_face', 'No face found in the image.'],
    ['multiple_faces', 'More than one face found. Use a photo of just one person.'],
    ['too_small', 'The face is too small. Use a closer photo.'],
    ['error', 'The image could not be processed. Try a different photo.'],
    ['something_new', 'The image could not be processed. Try a different photo.'],
  ])('rejects a photo with status %s', async (status, message) => {
    vector.status = status;
    const id = await newProfile();
    const error = await profiles
      .addSecurityServerProfileImage(user, id, upload)
      .catch(e => e);
    expect(error).toBeInstanceOf(ProfileImageRejectedError);
    expect(error.message).toBe(message);
    expect((await get(id)).images).toEqual([]);
    expect(storage.putFile).not.toHaveBeenCalled();
  });

  it('rejects data that is not an image', async () => {
    sharpState.normalizeFails = true;
    const id = await newProfile();
    await expect(profiles.addSecurityServerProfileImage(user, id, upload)).rejects.toThrow(
      'could not be processed'
    );
  });

  it('rejects an unknown profile before touching the image', async () => {
    await expect(profiles.addSecurityServerProfileImage(user, 'nope', upload)).rejects.toThrow(
      'Profile not found.'
    );
  });
});

describe('default image', () => {
  const twoImages = async () => {
    const id = await newProfile();
    const first = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('1'));
    const second = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('2'));
    storage.putFile.mockClear();
    return { id, first, second };
  };

  it('sets the default photo, rejecting one the profile does not have', async () => {
    const { id, second } = await twoImages();
    await profiles.setSecurityServerProfileDefaultImage(user, id, second);
    expect((await get(id)).defaultImageId).toBe(second);
    await expect(
      profiles.setSecurityServerProfileDefaultImage(user, id, 'nope')
    ).rejects.toThrow('Image not found.');
  });

  it('resolves to the chosen photo, else the oldest, else null', async () => {
    const { id, first, second } = await twoImages();
    expect(profiles.resolveSecurityServerProfileDefaultImageId(await get(id))).toBe(first);
    await profiles.setSecurityServerProfileDefaultImage(user, id, second);
    expect(profiles.resolveSecurityServerProfileDefaultImageId(await get(id))).toBe(second);
    expect(profiles.resolveSecurityServerProfileDefaultImageId({ images: [] })).toBeNull();
  });
});

describe('removeSecurityServerProfileImage', () => {
  it('removes the photo, deletes its files after commit and clears a default pointing at it', async () => {
    const id = await newProfile();
    const imageId = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('1'));
    await profiles.setSecurityServerProfileDefaultImage(user, id, imageId);
    const [image] = (await get(id)).images;

    await profiles.removeSecurityServerProfileImage(user, id, imageId);
    const profile = await get(id);
    expect(profile.images).toEqual([]);
    expect(profile).not.toHaveProperty('defaultImageId');
    expect(storage.deleteFiles).toHaveBeenCalledWith([image.imageKey, image.thumbnailKey]);
  });

  it('keeps the default when another photo is removed', async () => {
    const id = await newProfile();
    const a = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('1'));
    const b = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('2'));
    await profiles.setSecurityServerProfileDefaultImage(user, id, a);
    await profiles.removeSecurityServerProfileImage(user, id, b);
    expect((await get(id)).defaultImageId).toBe(a);
  });

  it('does not delete files when the removal rolls back', async () => {
    const id = await newProfile();
    const imageId = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('1'));
    storage.deleteFiles.mockClear();
    const spy = vi
      .spyOn(SecurityServerProfiles, 'updateAsync')
      .mockRejectedValueOnce(new Error('db down'));
    await expect(profiles.removeSecurityServerProfileImage(user, id, imageId)).rejects.toThrow(
      'db down'
    );
    spy.mockRestore();
    expect(storage.deleteFiles).not.toHaveBeenCalled();
    expect((await get(id)).images).toHaveLength(1);
  });

  it('rejects an unknown photo', async () => {
    const id = await newProfile();
    await expect(profiles.removeSecurityServerProfileImage(user, id, 'nope')).rejects.toThrow(
      'Image not found.'
    );
  });
});

describe('deleteSecurityServerProfile', () => {
  it('soft-deletes, empties the photos and deletes their files', async () => {
    const id = await newProfile();
    const imageId = await profiles.storeSecurityServerProfileImage(user, id, Buffer.from('1'));
    await profiles.setSecurityServerProfileDefaultImage(user, id, imageId);
    const [image] = (await get(id)).images;
    await (SecurityServerAlerts.rawCollection() as any).insertOne({ _id: 'a1', profileId: id } as any);

    await profiles.deleteSecurityServerProfile({ _id: 'u2' }, id);
    const profile = await get(id);
    expect(profile).toMatchObject({ images: [], deletedBy: 'u2' });
    expect(profile.deletedAt).toBeInstanceOf(Date);
    expect(profile).not.toHaveProperty('defaultImageId');
    expect(storage.deleteFiles).toHaveBeenCalledWith([image.imageKey, image.thumbnailKey]);
    expect(await SecurityServerAlerts.findOneAsync('a1')).toBeDefined();
  });

  it('deletes no files for a profile without photos', async () => {
    const id = await newProfile();
    await profiles.deleteSecurityServerProfile(user, id);
    expect(storage.deleteFiles).not.toHaveBeenCalled();
  });

  it('rejects a deleted profile', async () => {
    const id = await newProfile();
    await profiles.deleteSecurityServerProfile(user, id);
    await expect(profiles.deleteSecurityServerProfile(user, id)).rejects.toThrow(
      'Profile not found.'
    );
  });
});

describe('createMissingSecurityServerProfileThumbnails', () => {
  const image = (_id: string, extra = {}) => ({
    _id,
    imageKey: `k/${_id}.jpg`,
    uploadedAt: new Date(),
    uploadedBy: 'u1',
    ...extra,
  });

  it('adds thumbnails to photos without one, skipping deleted profiles', async () => {
    await (SecurityServerProfiles.rawCollection() as any).insertMany([
      {
        _id: 'p1',
        name: 'A',
        isTest: false,
        images: [image('i1'), image('i2', { thumbnailKey: 'k/i2.thumb.jpg' })],
      },
      { _id: 'p2', name: 'B', isTest: false, images: [image('i3')], deletedAt: new Date() },
    ] as any);
    storage.getFile.mockResolvedValue({ body: Buffer.from('jpeg') });

    expect(await profiles.createMissingSecurityServerProfileThumbnails()).toBe(1);
    const p1 = await get('p1');
    expect(p1.images[0].thumbnailKey).toBe('k/i1.thumb.jpg');
    expect(p1.images[1].thumbnailKey).toBe('k/i2.thumb.jpg');
    expect((await get('p2')).images[0]).not.toHaveProperty('thumbnailKey');
  });

  it('skips unreadable photos', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    await (SecurityServerProfiles.rawCollection() as any).insertOne({
      _id: 'p1',
      name: 'A',
      isTest: false,
      images: [image('i1')],
    } as any);
    storage.getFile.mockRejectedValue(new Error('gone'));
    expect(await profiles.createMissingSecurityServerProfileThumbnails()).toBe(0);
  });
});
