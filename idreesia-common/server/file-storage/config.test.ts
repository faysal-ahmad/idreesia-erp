import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getFileStorageConfig } from './config';

const KEYS = [
  'S3_ENDPOINT',
  'S3_PUBLIC_ENDPOINT',
  'S3_CDN_ENDPOINT',
  'S3_REGION',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_FORCE_PATH_STYLE',
];
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  KEYS.forEach(key => {
    saved[key] = process.env[key];
    delete process.env[key];
  });
});

afterEach(() => {
  KEYS.forEach(key => {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  });
});

const setRequired = () => {
  process.env.S3_ENDPOINT = 'http://s3';
  process.env.S3_BUCKET = 'b';
  process.env.S3_ACCESS_KEY_ID = 'k';
  process.env.S3_SECRET_ACCESS_KEY = 's';
};

describe('getFileStorageConfig', () => {
  it('names every missing required variable', () => {
    process.env.S3_BUCKET = 'b';
    expect(() => getFileStorageConfig()).toThrow(
      /S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY/
    );
  });

  it('applies defaults for the optional variables', () => {
    setRequired();
    expect(getFileStorageConfig()).toEqual({
      endpoint: 'http://s3',
      publicEndpoint: 'http://s3',
      cdnEndpoint: null,
      region: 'us-east-1',
      bucket: 'b',
      accessKeyId: 'k',
      secretAccessKey: 's',
      forcePathStyle: false,
    });
  });

  it('reads the optional variables when set', () => {
    setRequired();
    process.env.S3_PUBLIC_ENDPOINT = 'http://public';
    process.env.S3_CDN_ENDPOINT = 'http://cdn';
    process.env.S3_REGION = 'nyc3';
    process.env.S3_FORCE_PATH_STYLE = 'true';
    expect(getFileStorageConfig()).toMatchObject({
      publicEndpoint: 'http://public',
      cdnEndpoint: 'http://cdn',
      region: 'nyc3',
      forcePathStyle: true,
    });
  });
});
