import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import {
  AuditLogs,
  People,
} from 'meteor/idreesia-common/server/collections/common';
import {
  deleteFiles,
  putFile,
} from 'meteor/idreesia-common/server/file-storage';

import { PHOTO_AUDIT_FIELD, PHOTO_AUDIT_VALUE } from './people/people-mutations';
import { setPersonImage } from './set-person-image';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// Face recognition needs native OpenCV and image decoding needs sharp (only
// installed for the web app): neither is under test here.
const vector = vi.hoisted(() => ({
  data: { status: 'computed', modelVersion: 'test', computedAt: new Date(0) },
}));
vi.mock(
  'meteor/idreesia-common/server/business-logic/common/compute-image-vector-data',
  () => ({ computeVectorFromImageBuffer: () => vector.data })
);

const sharpState = vi.hoisted(() => ({ thumbnailFails: false }));
vi.mock('sharp', () => {
  const sharp = (input: Buffer) => {
    let isThumbnail = false;
    const pipeline = {
      rotate: () => pipeline,
      resize: (width: number) => {
        isThumbnail = width === 160;
        return pipeline;
      },
      jpeg: () => pipeline,
      toBuffer: async () => {
        if (!input.toString().startsWith('IMG')) throw new Error('bad image');
        if (isThumbnail && sharpState.thumbnailFails) throw new Error('no thumb');
        return Buffer.from(isThumbnail ? 'IMG-thumb' : 'IMG-normalized');
      },
    };
    return pipeline;
  };
  return { default: sharp };
});

const putFileMock = putFile as unknown as ReturnType<typeof vi.fn>;
const deleteFilesMock = deleteFiles as unknown as ReturnType<typeof vi.fn>;

const user = { _id: 'u1' };
const imageData = Buffer.from('IMGDATA').toString('base64');

const addPerson = (sharedData: Record<string, unknown> = {}) =>
  (
    People.rawCollection() as unknown as {
      insertOne(d: object): Promise<unknown>;
    }
  ).insertOne({ _id: 'p1', sharedData: { name: 'Ali', ...sharedData } });

beforeEach(() => {
  sharpState.thumbnailFails = false;
  putFileMock.mockClear();
  deleteFilesMock.mockReset().mockResolvedValue(undefined);
});

describe('setPersonImage', () => {
  it('stores the photo and thumbnail and points the person at them', async () => {
    await addPerson();
    const person = await setPersonImage(user, 'p1', imageData);

    expect(putFileMock).toHaveBeenCalledTimes(2);
    expect(person?.sharedData.imageKey).toMatch(/^people-images\/p1\/.+\.jpg$/);
    expect(person?.sharedData.imageThumbnailKey).toMatch(/\.thumb\.jpg$/);
    expect(person?.sharedData.imageVectorData).toEqual(vector.data);
    expect(person?.updatedBy).toBe('u1');
  });

  it('audits the photo change without naming the files', async () => {
    await addPerson();
    await setPersonImage(user, 'p1', imageData);

    const logs = await AuditLogs.find({ entityId: 'p1' }).fetchAsync();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: 'u1',
    });
    expect(JSON.stringify(logs[0].auditValues)).toContain(PHOTO_AUDIT_FIELD);
    expect(JSON.stringify(logs[0].auditValues)).toContain(PHOTO_AUDIT_VALUE);
  });

  it('deletes the files of the photo it replaces', async () => {
    await addPerson({ imageKey: 'old/key.jpg', imageThumbnailKey: 'old/thumb.jpg' });
    await setPersonImage(user, 'p1', imageData);
    expect(deleteFilesMock).toHaveBeenCalledWith(['old/key.jpg', 'old/thumb.jpg']);
  });

  it('drops the old thumbnail when the new one cannot be made', async () => {
    await addPerson({ imageThumbnailKey: 'old/thumb.jpg' });
    sharpState.thumbnailFails = true;
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const person = await setPersonImage(user, 'p1', imageData);

    expect(putFileMock).toHaveBeenCalledTimes(1);
    expect(person?.sharedData.imageKey).toBeDefined();
    expect(person?.sharedData.imageThumbnailKey).toBeUndefined();
    spy.mockRestore();
  });

  it('rejects data that is not an image, storing nothing', async () => {
    await addPerson();
    await expect(
      setPersonImage(user, 'p1', Buffer.from('nope').toString('base64'))
    ).rejects.toThrow('not a valid image');
    expect(putFileMock).not.toHaveBeenCalled();
  });

  it('rejects an unknown person and deletes the files it just stored', async () => {
    await expect(setPersonImage(user, 'missing', imageData)).rejects.toThrow(
      "Person 'missing' was not found."
    );
    expect(putFileMock).toHaveBeenCalledTimes(2);
    const stored = putFileMock.mock.calls.map(call => call[0]);
    expect(deleteFilesMock).toHaveBeenCalledWith(stored);
  });

  it('leaves the person unchanged, and removes the new files, when the audit log fails', async () => {
    await addPerson({ imageKey: 'old/key.jpg' });
    vi.spyOn(AuditLogs, 'insertAsync').mockRejectedValueOnce(new Error('boom'));

    await expect(setPersonImage(user, 'p1', imageData)).rejects.toThrow('boom');

    expect((await People.findOneAsync('p1'))?.sharedData.imageKey).toBe(
      'old/key.jpg'
    );
    const stored = putFileMock.mock.calls.map(call => call[0]);
    expect(deleteFilesMock).toHaveBeenCalledTimes(1);
    expect(deleteFilesMock).toHaveBeenCalledWith(stored);
  });
});
