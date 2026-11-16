import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getPublicFileUrl,
  PUBLIC_IMMUTABLE_FILE,
  putFile,
} from 'meteor/idreesia-common/server/file-storage';

import {
  decodeAndNormalizeImage,
  getStoredImageUrl,
  storeImage,
} from './stored-images';

vi.mock('meteor/idreesia-common/server/file-storage', async () =>
  import('meteor/idreesia-common/server/test-utils/file-storage-mock')
);

// sharp is only installed for the web app, and image decoding is not what is
// under test: the pipeline is replaced by one that fails for bytes that are
// not a "valid image" (anything not starting with 'IMG').
const sharpCalls = vi.hoisted(() => ({ input: null as Buffer | null }));

vi.mock('sharp', () => {
  const sharp = (input: Buffer) => {
    sharpCalls.input = input;
    const pipeline = {
      rotate: () => pipeline,
      resize: () => pipeline,
      jpeg: () => pipeline,
      toBuffer: async () => {
        if (!input.toString().startsWith('IMG')) {
          throw new Error('Input buffer contains unsupported image format');
        }
        return Buffer.from('normalized');
      },
    };
    return pipeline;
  };
  return { default: sharp };
});

const putFileMock = putFile as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  putFileMock.mockClear();
  sharpCalls.input = null;
});

describe('decodeAndNormalizeImage', () => {
  const base64 = Buffer.from('IMGDATA').toString('base64');

  it('decodes plain base64 and returns the normalised image', async () => {
    expect((await decodeAndNormalizeImage(base64)).toString()).toBe('normalized');
    expect(sharpCalls.input?.toString()).toBe('IMGDATA');
  });

  it('accepts a data: URL prefix', async () => {
    await decodeAndNormalizeImage(`data:image/png;base64,${base64}`);
    expect(sharpCalls.input?.toString()).toBe('IMGDATA');
  });

  it('rejects data that is not an image', async () => {
    await expect(
      decodeAndNormalizeImage(Buffer.from('not an image').toString('base64'))
    ).rejects.toThrow('The uploaded file is not a valid image.');
  });
});

describe('storeImage', () => {
  it('stores a public immutable image under <folder>/<ownerId>/', async () => {
    const image = Buffer.from('image');
    const { imageKey, imageThumbnailKey } = await storeImage(
      'people-images',
      'p1',
      image,
      'image/png'
    );

    expect(imageKey).toMatch(/^people-images\/p1\/.+\.png$/);
    expect(imageThumbnailKey).toBeNull();
    expect(putFileMock).toHaveBeenCalledTimes(1);
    expect(putFileMock).toHaveBeenCalledWith(
      imageKey,
      image,
      'image/png',
      PUBLIC_IMMUTABLE_FILE
    );
  });

  it('maps jpeg to jpg and falls back to jpg for an odd MIME type', async () => {
    expect((await storeImage('f', 'o', Buffer.from('x'), 'image/jpeg')).imageKey)
      .toMatch(/\.jpg$/);
    expect((await storeImage('f', 'o', Buffer.from('x'), 'image')).imageKey)
      .toMatch(/\.jpg$/);
    expect((await storeImage('f', 'o', Buffer.from('x'), 'image/IMAGE+xml')).imageKey)
      .toMatch(/\.imagexml$/);
  });

  it('stores the thumbnail next to the image as a jpeg', async () => {
    const thumbnail = Buffer.from('thumb');
    const { imageKey, imageThumbnailKey } = await storeImage(
      'f',
      'o',
      Buffer.from('x'),
      'image/png',
      thumbnail
    );

    expect(imageThumbnailKey).toMatch(/^f\/o\/.+\.thumb\.jpg$/);
    expect(imageThumbnailKey?.split('.')[0]).toBe(imageKey.split('.')[0]);
    expect(putFileMock).toHaveBeenLastCalledWith(
      imageThumbnailKey,
      thumbnail,
      'image/jpeg',
      PUBLIC_IMMUTABLE_FILE
    );
  });

  it('uses a new key for every image', async () => {
    const a = await storeImage('f', 'o', Buffer.from('x'), 'image/png');
    const b = await storeImage('f', 'o', Buffer.from('x'), 'image/png');
    expect(a.imageKey).not.toBe(b.imageKey);
  });
});

describe('getStoredImageUrl', () => {
  it('is the public URL of the key, or null without one', () => {
    expect(getStoredImageUrl('f/o/a.jpg')).toBe('https://storage.test/public');
    expect(getPublicFileUrl).toHaveBeenCalledWith('f/o/a.jpg');
    expect(getStoredImageUrl(null)).toBeNull();
    expect(getStoredImageUrl('')).toBeNull();
  });
});
