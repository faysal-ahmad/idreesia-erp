import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getRequestPublicEndpoint, runWithRequestHost } from './request-host';

const ENV_KEYS = [
  'S3_ENDPOINT',
  'S3_PUBLIC_ENDPOINT',
  'S3_BUCKET',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
] as const;
const saved: Record<string, string | undefined> = {};

beforeEach(() => {
  ENV_KEYS.forEach(key => {
    saved[key] = process.env[key];
  });
  process.env.S3_ENDPOINT = 'http://rustfs:9000';
  process.env.S3_BUCKET = 'bucket';
  process.env.S3_ACCESS_KEY_ID = 'id';
  process.env.S3_SECRET_ACCESS_KEY = 'secret';
  process.env.S3_PUBLIC_ENDPOINT = 'http://localhost:9000';
});

afterEach(() => {
  ENV_KEYS.forEach(key => {
    if (saved[key] === undefined) delete process.env[key];
    else process.env[key] = saved[key];
  });
});

describe('getRequestPublicEndpoint', () => {
  it('returns the configured public endpoint outside a request', () => {
    expect(getRequestPublicEndpoint()).toBe('http://localhost:9000');
  });

  it('moves a localhost endpoint to the host the client used', () => {
    const endpoint = runWithRequestHost('192.168.1.5', getRequestPublicEndpoint);
    expect(endpoint).toBe('http://192.168.1.5:9000');
  });

  it('keeps the endpoint when the client itself is on localhost', () => {
    for (const host of ['localhost', '127.0.0.1', '::1']) {
      expect(runWithRequestHost(host, getRequestPublicEndpoint)).toBe(
        'http://localhost:9000'
      );
    }
  });

  it('never rewrites a production endpoint', () => {
    process.env.S3_PUBLIC_ENDPOINT = 'https://files.example.com';
    expect(runWithRequestHost('192.168.1.5', getRequestPublicEndpoint)).toBe(
      'https://files.example.com'
    );
  });

  it('falls back to the internal endpoint when no public one is set', () => {
    delete process.env.S3_PUBLIC_ENDPOINT;
    expect(getRequestPublicEndpoint()).toBe('http://rustfs:9000');
  });

  it('ignores an empty host and returns the callback result', () => {
    expect(runWithRequestHost(undefined, () => 42)).toBe(42);
    expect(runWithRequestHost(undefined, getRequestPublicEndpoint)).toBe(
      'http://localhost:9000'
    );
  });

  it('returns the endpoint unchanged when it is not a valid URL', () => {
    process.env.S3_PUBLIC_ENDPOINT = 'not a url';
    expect(runWithRequestHost('192.168.1.5', getRequestPublicEndpoint)).toBe(
      'not a url'
    );
  });
});
