import { afterEach, describe, expect, it } from 'vitest';
import type { Request } from 'express';

import { getClientAddress, getThrottleAddress } from './client-address';

const req = (forwardedFor: string | undefined, remote: string | undefined) =>
  ({
    headers: forwardedFor === undefined ? {} : { 'x-forwarded-for': forwardedFor },
    socket: { remoteAddress: remote },
  }) as unknown as Request;

const original = process.env.HTTP_FORWARDED_COUNT;
afterEach(() => {
  if (original === undefined) delete process.env.HTTP_FORWARDED_COUNT;
  else process.env.HTTP_FORWARDED_COUNT = original;
});

describe('getClientAddress', () => {
  it('uses the socket address when no proxy count is set, ignoring a spoofed header', () => {
    delete process.env.HTTP_FORWARDED_COUNT;
    expect(getClientAddress(req('6.6.6.6', '10.0.0.1'))).toBe('10.0.0.1');
  });

  it('reads the entry the outermost trusted proxy added, not client-supplied ones', () => {
    process.env.HTTP_FORWARDED_COUNT = '2';
    // client spoofed 6.6.6.6; proxies appended the real client then the edge
    expect(getClientAddress(req('6.6.6.6, 1.2.3.4, 9.9.9.9', '10.0.0.1'))).toBe('1.2.3.4');
    process.env.HTTP_FORWARDED_COUNT = '1';
    expect(getClientAddress(req('6.6.6.6, 1.2.3.4', '10.0.0.1'))).toBe('1.2.3.4');
  });

  it('falls back to the socket when the header has fewer entries than proxies', () => {
    process.env.HTTP_FORWARDED_COUNT = '2';
    expect(getClientAddress(req('1.2.3.4', '10.0.0.1'))).toBe('10.0.0.1');
    expect(getClientAddress(req(undefined, '10.0.0.1'))).toBe('10.0.0.1');
  });

  it('ignores an invalid or zero proxy count', () => {
    for (const v of ['abc', '0', '-1', '']) {
      process.env.HTTP_FORWARDED_COUNT = v;
      expect(getClientAddress(req('1.2.3.4', '10.0.0.1'))).toBe('10.0.0.1');
    }
  });

  it('is null when nothing is known', () => {
    delete process.env.HTTP_FORWARDED_COUNT;
    expect(getClientAddress(req(undefined, undefined))).toBeNull();
  });
});

describe('getThrottleAddress', () => {
  it('is "unknown" for no address', () => {
    expect(getThrottleAddress(null)).toBe('unknown');
    expect(getThrottleAddress(undefined)).toBe('unknown');
    expect(getThrottleAddress('')).toBe('unknown');
  });

  it('treats an IPv4-mapped IPv6 address as plain IPv4', () => {
    expect(getThrottleAddress('::ffff:1.2.3.4')).toBe(getThrottleAddress('1.2.3.4'));
  });

  it('groups addresses of one IPv6 /56 together but not different ones', () => {
    expect(getThrottleAddress('2001:db8:1:ab01::1')).toBe(getThrottleAddress('2001:db8:1:ab99::2'));
    expect(getThrottleAddress('2001:db8:1:ab01::1')).not.toBe(getThrottleAddress('2001:db8:2:ab01::1'));
  });
});
