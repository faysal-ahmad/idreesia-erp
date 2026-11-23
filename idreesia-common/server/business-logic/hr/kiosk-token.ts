import { createHmac, timingSafeEqual } from 'crypto';

import { hrError } from './errors';

// How long a matched karkun's token works. Longer than the kiosk page keeps a record on screen.
export const KIOSK_TOKEN_TTL_MS = 2 * 60 * 1000;

const SECRET_VARIABLE = 'ATTENDANCE_KIOSK_TOKEN_SECRET';

const getSecret = () => {
  const secret = process.env[SECRET_VARIABLE];
  if (!secret) {
    // Fail closed: without a secret nobody can be checked in.
    throw new Error(`${SECRET_VARIABLE} is not set.`);
  }
  return secret;
};

const sign = (payload: string) =>
  createHmac('sha256', getSecret()).update(payload).digest('base64url');

/**
 * A token proving this karkun was matched by face a moment ago, for the
 * public attendance kiosk to send back when checking in or out. It is
 * `<payload>.<signature>`: the karkun id and expiry, signed with a server
 * secret, so it can't be forged or used after it expires. Nothing is stored.
 */
export function createKioskToken(karkunId: string, now = Date.now()): string {
  const payload = Buffer.from(
    JSON.stringify({ karkunId, expiresAt: now + KIOSK_TOKEN_TTL_MS })
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

/** The karkun id in a valid, unexpired token; FORBIDDEN otherwise. */
export function verifyKioskToken(token: unknown, now = Date.now()): string {
  const invalid = () =>
    hrError('FORBIDDEN', 'Your session has expired. Please fetch your record again.');
  if (typeof token !== 'string') throw invalid();

  const [payload, signature, ...rest] = token.split('.');
  if (!payload || !signature || rest.length > 0) throw invalid();

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw invalid();
  }

  try {
    const { karkunId, expiresAt } = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (typeof karkunId !== 'string' || typeof expiresAt !== 'number' || expiresAt < now) {
      throw invalid();
    }
    return karkunId;
  } catch {
    throw invalid();
  }
}
