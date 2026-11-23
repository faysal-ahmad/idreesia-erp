import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { createKioskToken, KIOSK_TOKEN_TTL_MS, verifyKioskToken } from './kiosk-token';

const NOW = 1_700_000_000_000;

beforeEach(() => {
  process.env.ATTENDANCE_KIOSK_TOKEN_SECRET = 'test-secret';
});

afterEach(() => {
  delete process.env.ATTENDANCE_KIOSK_TOKEN_SECRET;
});

describe('kiosk tokens', () => {
  it('give back the karkun id until they expire', () => {
    const token = createKioskToken('k1', NOW);

    expect(verifyKioskToken(token, NOW + 1000)).toBe('k1');
    expect(verifyKioskToken(token, NOW + KIOSK_TOKEN_TTL_MS)).toBe('k1');
  });

  it('are refused after they expire', () => {
    const token = createKioskToken('k1', NOW);

    expect(() => verifyKioskToken(token, NOW + KIOSK_TOKEN_TTL_MS + 1)).toThrow(
      /expired/
    );
  });

  it('are refused when changed, e.g. to another karkun', () => {
    const [, signature] = createKioskToken('k1', NOW).split('.');
    const [forgedPayload] = createKioskToken('k2', NOW).split('.');

    expect(() => verifyKioskToken(`${forgedPayload}.${signature}`, NOW)).toThrow();
  });

  it('are refused when signed with another secret', () => {
    const token = createKioskToken('k1', NOW);
    process.env.ATTENDANCE_KIOSK_TOKEN_SECRET = 'other-secret';

    expect(() => verifyKioskToken(token, NOW)).toThrow();
  });

  it('are refused when missing or malformed', () => {
    [undefined, null, '', 'abc', 'a.b.c', 42].forEach(value => {
      expect(() => verifyKioskToken(value, NOW)).toThrow();
    });
  });

  it('cannot be made without a secret', () => {
    delete process.env.ATTENDANCE_KIOSK_TOKEN_SECRET;

    expect(() => createKioskToken('k1', NOW)).toThrow(/not set/);
  });
});
