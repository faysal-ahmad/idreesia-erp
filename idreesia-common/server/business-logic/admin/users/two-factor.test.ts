import * as OTPAuth from 'otpauth';
import { describe, expect, it } from 'vitest';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { MAX_FREE_ATTEMPTS } from './login-attempts';
import {
  consumeTwoFactorCode,
  disableTwoFactor,
  enableTwoFactor,
  isTwoFactorCodeValid,
  resetTwoFactor,
  startTwoFactorSetup,
} from './two-factor';
import { isTwoFactorEnabled } from './two-factor-status';

// `periodsAhead` gives the code of a later 30-second period, still inside
// the accepted window but newer than one already used.
const codeFor = (secret: string, periodsAhead = 0) =>
  new OTPAuth.TOTP({ secret: OTPAuth.Secret.fromBase32(secret) }).generate({
    timestamp: Date.now() + periodsAhead * 30_000,
  });

const wrongCodeFor = (secret: string) =>
  String((Number(codeFor(secret)) + 500_000) % 1_000_000).padStart(6, '0');

const insertUser = async (fields: Record<string, unknown> = {}) => {
  const userId = 'u1';
  await Users.insertAsync({ _id: userId, username: 'ali', ...fields });
  return { _id: userId };
};

const twoFactorOf = async (userId: string) =>
  (await Users.findOneAsync(userId))?.services?.twoFactorAuthentication;

const logTypes = async (userId: string) =>
  (await SecurityLogs.find({ userId }).fetchAsync()).map(
    log => log.operationType
  );

describe('isTwoFactorCodeValid', () => {
  it('accepts the current code and rejects others', () => {
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    expect(isTwoFactorCodeValid(secret, codeFor(secret))).toBe(true);
    expect(isTwoFactorCodeValid(secret, wrongCodeFor(secret))).toBe(false);
    expect(isTwoFactorCodeValid(secret, '')).toBe(false);
  });
});

describe('consumeTwoFactorCode', () => {
  it('accepts each code once, and only codes newer than the last used', async () => {
    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const user = await insertUser({
      services: { twoFactorAuthentication: { secret, type: 'otp' } },
    });

    const now = codeFor(secret);
    const later = codeFor(secret, 2);
    const between = codeFor(secret, 1);
    expect(await consumeTwoFactorCode(user._id, secret, now)).toBe(true);
    expect(await consumeTwoFactorCode(user._id, secret, now)).toBe(false);
    expect(await consumeTwoFactorCode(user._id, secret, later)).toBe(true);
    // Older than the last used code.
    expect(await consumeTwoFactorCode(user._id, secret, between)).toBe(false);
    expect(
      await consumeTwoFactorCode(user._id, secret, wrongCodeFor(secret))
    ).toBe(false);
  });
});

describe('two-factor setup', () => {
  it('stores a pending secret that does not enable two-factor yet', async () => {
    const user = await insertUser();
    const setup = await startTwoFactorSetup(user);

    expect(setup.uri).toContain('otpauth://totp/');
    expect(setup.uri).toContain('ali');
    expect(setup.qrCodeSvg).toContain('<svg');
    expect(await twoFactorOf(user._id)).toEqual({ secret: setup.secret });
    expect(isTwoFactorEnabled(await Users.findOneAsync(user._id))).toBe(false);
  });

  it('enables two-factor only with a valid code', async () => {
    const user = await insertUser();
    const { secret } = await startTwoFactorSetup(user);

    await expect(
      enableTwoFactor({ code: wrongCodeFor(secret) }, user, 'admin')
    ).rejects.toThrow('Invalid verification code.');

    const result = await enableTwoFactor(
      { code: codeFor(secret) },
      user,
      'admin'
    );
    expect(result.twoFactorEnabled).toBe(true);
    expect(await twoFactorOf(user._id)).toMatchObject({ secret, type: 'otp' });
    expect(await logTypes(user._id)).toEqual([
      SecurityOperationType.TWO_FACTOR_ENABLED,
    ]);
  });

  it('refuses to start again while enabled', async () => {
    const user = await insertUser({
      services: { twoFactorAuthentication: { secret: 'ABC', type: 'otp' } },
    });
    await expect(startTwoFactorSetup(user)).rejects.toThrow(
      'already enabled'
    );
  });

  it('signs out every other session when enabled', async () => {
    const user = await insertUser({
      services: {
        resume: {
          loginTokens: [
            { hashedToken: 'current', when: new Date() },
            { hashedToken: 'other', when: new Date() },
          ],
        },
      },
    });
    const { secret } = await startTwoFactorSetup(user);

    await enableTwoFactor(
      { code: codeFor(secret), currentLoginTokenHash: 'current' },
      user,
      'admin'
    );
    const tokens = (await Users.findOneAsync(user._id))?.services?.resume
      ?.loginTokens as Array<{ hashedToken: string }>;
    expect(tokens.map(token => token.hashedToken)).toEqual(['current']);
  });

  it('blocks code attempts after too many', async () => {
    const user = await insertUser();
    const { secret } = await startTwoFactorSetup(user);

    for (let i = 0; i < MAX_FREE_ATTEMPTS; i += 1) {
       
      await expect(
        enableTwoFactor({ code: wrongCodeFor(secret) }, user, 'admin')
      ).rejects.toThrow('Invalid verification code.');
    }
    await expect(
      enableTwoFactor({ code: codeFor(secret) }, user, 'admin')
    ).rejects.toThrow('Too many failed attempts');
  });

  it('requires setup before enabling', async () => {
    const user = await insertUser();
    await expect(
      enableTwoFactor({ code: '123456' }, user, 'admin')
    ).rejects.toThrow('Start the two-factor setup first.');
  });
});

describe('disableTwoFactor', () => {
  it('needs a valid current code', async () => {
    const user = await insertUser();
    const { secret } = await startTwoFactorSetup(user);
    const enableCode = codeFor(secret);
    await enableTwoFactor({ code: enableCode }, user, 'admin');

    await expect(
      disableTwoFactor({ code: wrongCodeFor(secret) }, user, 'admin')
    ).rejects.toThrow('Invalid verification code.');

    // The code used to enable it can't be replayed.
    await expect(
      disableTwoFactor({ code: enableCode }, user, 'admin')
    ).rejects.toThrow('Invalid verification code.');

    const result = await disableTwoFactor(
      { code: codeFor(secret, 2) },
      user,
      'admin'
    );
    expect(result.twoFactorEnabled).toBe(false);
    expect(await twoFactorOf(user._id)).toBeUndefined();
    expect(await logTypes(user._id)).toContain(
      SecurityOperationType.TWO_FACTOR_DISABLED
    );
  });
});

describe('resetTwoFactor', () => {
  it('removes two-factor without a code and logs the administrator', async () => {
    const user = await insertUser({
      services: { twoFactorAuthentication: { secret: 'ABC', type: 'otp' } },
    });

    await Users.insertAsync({ _id: 'admin1', isSuperAdmin: true } as never);

    const result = await resetTwoFactor(
      { userId: user._id },
      { _id: 'admin1' },
      'admin'
    );
    expect(result.twoFactorEnabled).toBe(false);
    expect(await twoFactorOf(user._id)).toBeUndefined();

    const logs = await SecurityLogs.find({ userId: user._id }).fetchAsync();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      operationType: SecurityOperationType.TWO_FACTOR_RESET,
      operationBy: 'admin1',
    });
  });

  it('refuses a caller who is not a super admin', async () => {
    const user = await insertUser({
      services: { twoFactorAuthentication: { secret: 'ABC', type: 'otp' } },
    });
    await Users.insertAsync({ _id: 'manager' } as never);

    await expect(
      resetTwoFactor({ userId: user._id }, { _id: 'manager' }, 'admin')
    ).rejects.toThrow('super admin');
    expect(await twoFactorOf(user._id)).toBeDefined();
  });
});
