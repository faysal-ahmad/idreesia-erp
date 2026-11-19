import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn();
const getSignedUrl = vi.fn(async (_client: unknown, command: any, _options?: unknown) => {
  return `https://signed.test/${command.input.Key}`;
});

vi.mock('./client', () => ({
  getInternalClient: () => ({ send }),
  getPublicClient: () => ({ public: true }),
}));
vi.mock('@aws-sdk/s3-request-presigner', () => ({ getSignedUrl }));

const {
  copyFile,
  deleteFiles,
  fileExists,
  getFile,
  getFileInfo,
  getFileUrl,
  getPublicFileUrl,
  getUploadUrl,
  putFile,
} = await import('./file-storage');

const ENV_KEYS = [
  'S3_ENDPOINT',
  'S3_PUBLIC_ENDPOINT',
  'S3_CDN_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_FORCE_PATH_STYLE',
];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  ENV_KEYS.forEach(key => {
    saved[key] = process.env[key];
    delete process.env[key];
  });
  process.env.S3_ENDPOINT = 'https://nyc3.example.com';
  process.env.S3_BUCKET = 'bkt';
  process.env.S3_ACCESS_KEY_ID = 'k';
  process.env.S3_SECRET_ACCESS_KEY = 's';
  send.mockReset();
  getSignedUrl.mockClear();
});

afterEach(() => {
  ENV_KEYS.forEach(key => {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  });
});

describe('putFile', () => {
  it('sends only the options that were given', async () => {
    send.mockResolvedValue({});
    await putFile('a/b.jpg', Buffer.from('x'), 'image/jpeg');
    expect(send.mock.calls[0][0].input).toEqual({
      Bucket: 'bkt',
      Key: 'a/b.jpg',
      Body: Buffer.from('x'),
      ContentType: 'image/jpeg',
    });

    await putFile('a/c.jpg', Buffer.from('x'), 'image/jpeg', {
      cacheControl: 'max-age=1',
      acl: 'public-read',
    });
    expect(send.mock.calls[1][0].input).toMatchObject({
      CacheControl: 'max-age=1',
      ACL: 'public-read',
    });
  });
});

describe('fileExists and getFileInfo', () => {
  it('answer false / null for a missing object', async () => {
    send.mockRejectedValue(Object.assign(new Error('nf'), { name: 'NotFound' }));
    expect(await fileExists('k')).toBe(false);
    expect(await getFileInfo('k')).toBeNull();
  });

  it('rethrow other errors', async () => {
    send.mockRejectedValue(new Error('boom'));
    await expect(fileExists('k')).rejects.toThrow('boom');
    await expect(getFileInfo('k')).rejects.toThrow('boom');
  });

  it('report size, type and an unquoted etag', async () => {
    send.mockResolvedValue({
      ContentLength: 12,
      ContentType: 'image/png',
      ETag: '"abc"',
    });
    expect(await fileExists('k')).toBe(true);
    expect(await getFileInfo('k')).toEqual({
      size: 12,
      contentType: 'image/png',
      etag: 'abc',
    });
  });

  it('defaults the size to 0 when the store reports none', async () => {
    send.mockResolvedValue({});
    expect((await getFileInfo('k'))?.size).toBe(0);
  });
});

describe('deleteFiles', () => {
  it('deletes in batches of at most 1000 keys', async () => {
    send.mockResolvedValue({});
    const keys = Array.from({ length: 2500 }, (_, i) => `k${i}`);
    await deleteFiles(keys);
    expect(send).toHaveBeenCalledTimes(3);
    const sizes = send.mock.calls.map(
      ([command]) => command.input.Delete.Objects.length
    );
    expect(sizes).toEqual([1000, 1000, 500]);
  });

  it('sends nothing for no keys', async () => {
    await deleteFiles([]);
    expect(send).not.toHaveBeenCalled();
  });
});

describe('getFile', () => {
  it('returns the body as a Buffer with its content type', async () => {
    send.mockResolvedValue({
      Body: { transformToByteArray: async () => new Uint8Array([1, 2, 3]) },
      ContentType: 'application/pdf',
    });
    expect(await getFile('k')).toEqual({
      body: Buffer.from([1, 2, 3]),
      contentType: 'application/pdf',
    });
  });
});

describe('copyFile', () => {
  it('url-encodes each segment of the source key but keeps the slashes', async () => {
    send.mockResolvedValue({});
    await copyFile('folder/my file#1.jpg', 'folder/new.jpg');
    expect(send.mock.calls[0][0].input).toEqual({
      Bucket: 'bkt',
      Key: 'folder/new.jpg',
      CopySource: 'bkt/folder/my%20file%231.jpg',
    });
  });
});

describe('getPublicFileUrl', () => {
  it('uses virtual-host style by default', () => {
    expect(getPublicFileUrl('people/a b.jpg')).toBe(
      'https://bkt.nyc3.example.com/people/a%20b.jpg'
    );
  });

  it('uses path style when forced', () => {
    process.env.S3_ENDPOINT = 'http://localhost:9000/';
    process.env.S3_FORCE_PATH_STYLE = 'true';
    expect(getPublicFileUrl('people/a.jpg')).toBe(
      'http://localhost:9000/bkt/people/a.jpg'
    );
  });

  it('prefers the CDN endpoint and trims its trailing slash', () => {
    process.env.S3_CDN_ENDPOINT = 'https://cdn.example.com//';
    expect(getPublicFileUrl('people/a.jpg')).toBe(
      'https://cdn.example.com/people/a.jpg'
    );
  });
});

describe('presigned URLs', () => {
  it('signs a GET with the requested expiry', async () => {
    const url = await getFileUrl('k.pdf', 60);
    expect(url).toBe('https://signed.test/k.pdf');
    expect(getSignedUrl.mock.calls[0][2]).toEqual({ expiresIn: 60 });
    expect(getSignedUrl.mock.calls[0][1].input.ResponseContentDisposition).toBe(
      undefined
    );
  });

  it('adds a Content-Disposition with an ASCII fallback and UTF-8 name', async () => {
    await getFileUrl('k', 60, { downloadFileName: 'résumé "x".pdf' });
    const disposition =
      getSignedUrl.mock.calls[0][1].input.ResponseContentDisposition;
    expect(disposition).toBe(
      `attachment; filename="r_sum_ _x_.pdf"; filename*=UTF-8''r%C3%A9sum%C3%A9%20%22x%22.pdf`
    );

    await getFileUrl('k', 60, { downloadFileName: 'a.pdf', inline: true });
    expect(
      getSignedUrl.mock.calls[1][1].input.ResponseContentDisposition
    ).toMatch(/^inline;/);
  });

  it('signs an upload with its content type', async () => {
    await getUploadUrl('k', 'image/png');
    expect(getSignedUrl.mock.calls[0][1].input).toMatchObject({
      Key: 'k',
      ContentType: 'image/png',
    });
    expect(getSignedUrl.mock.calls[0][2]).toEqual({ expiresIn: 900 });
  });
});
