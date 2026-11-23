import { describe, expect, it } from 'vitest';

import { TrustedDeviceErrorCode } from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  TrustedDevices,
  Users,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  DEVICE_VALID_MS,
  enrollTrustedDevice,
  loginWithTrustedDevice,
  MAX_DEVICES_PER_USER,
  MAX_PIN_ATTEMPTS,
  removeTrustedDevice,
  revokeUserTrustedDevices,
} from './trusted-devices';

const insertUser = async (id = 'u1', fields: Record<string, unknown> = {}) => {
  await Users.insertAsync({
    _id: id,
    username: `user-${id}`,
    services: { password: { bcrypt: `hash-of-${id}` } },
    ...fields,
  });
  return { _id: id };
};

const enroll = async (user: { _id: string }, pin = '1234', name = 'Phone') =>
  enrollTrustedDevice({ pin, name }, user, 'admin');

const codeOf = async (promise: Promise<unknown>) => {
  try {
    await promise;
  } catch (error) {
    return (error as { extensions?: { code?: string } }).extensions?.code;
  }
  return undefined;
};

const logTypes = async (userId: string) =>
  (await SecurityLogs.find({ userId }).fetchAsync()).map(
    log => log.operationType
  );

describe('enrollTrustedDevice', () => {
  it('returns a secret, keeps only a hash and logs it', async () => {
    const user = await insertUser();
    const { deviceId, deviceSecret } = await enroll(user);

    expect(deviceSecret).toHaveLength(64);
    const device = await TrustedDevices.findOneAsync(deviceId);
    expect(device?.userId).toBe('u1');
    expect(JSON.stringify(device)).not.toContain(deviceSecret);
    expect(JSON.stringify(device)).not.toContain('"1234"');
    expect(await logTypes('u1')).toEqual([
      SecurityOperationType.TRUSTED_DEVICE_ENROLLED,
    ]);
  });

  it.each(['123', '12345', 'abcd', '12 4', ''])(
    'rejects the PIN "%s"',
    async pin => {
      const user = await insertUser();
      expect(await codeOf(enroll(user, pin))).toBe('BAD_USER_INPUT');
    }
  );

  it('accepts any four digits, with no pattern rules', async () => {
    const user = await insertUser();
    for (const pin of ['0000', '1111', '1234', '4321']) {
      expect(await codeOf(enroll(user, pin))).toBeUndefined();
    }
  });

  it('requires a code when two-factor is on', async () => {
    const user = await insertUser('u1', {
      services: {
        password: { bcrypt: 'x' },
        twoFactorAuthentication: { secret: 'JBSWY3DPEHPK3PXP', type: 'otp' },
      },
    });
    await expect(enroll(user)).rejects.toThrow('verification code');
    expect(await TrustedDevices.find().countAsync()).toBe(0);
  });

  it('replaces the previous credential of a device when changing the PIN', async () => {
    const user = await insertUser();
    const first = await enroll(user, '1111');
    const second = await enrollTrustedDevice(
      { pin: '2222', replaceDeviceId: first.deviceId },
      user,
      'admin'
    );

    expect(await TrustedDevices.findOneAsync(first.deviceId)).toBeUndefined();
    await expect(
      loginWithTrustedDevice({ ...second, secret: second.deviceSecret, pin: '2222' })
    ).resolves.toBe('u1');
  });

  it('revokes the oldest device past the limit', async () => {
    const user = await insertUser();
    const first = await enroll(user);
    for (let i = 0; i < MAX_DEVICES_PER_USER; i += 1) {
      await enroll(user);
    }

    const device = await TrustedDevices.findOneAsync(first.deviceId);
    expect(device?.revokedAt).toBeTruthy();
    const active = await TrustedDevices.find({
      userId: 'u1',
      revokedAt: null,
    }).countAsync();
    expect(active).toBe(MAX_DEVICES_PER_USER);
  });
});

describe('loginWithTrustedDevice', () => {
  const login = (
    device: { deviceId: string; deviceSecret: string },
    pin: string
  ) =>
    loginWithTrustedDevice({
      deviceId: device.deviceId,
      secret: device.deviceSecret,
      pin,
    });

  it('returns the user for the right secret and PIN, and extends the device', async () => {
    const user = await insertUser();
    const device = await enroll(user, '0000');
    await TrustedDevices.updateAsync(device.deviceId, {
      $set: { expiresAt: new Date(Date.now() + 1000) },
    });

    await expect(login(device, '0000')).resolves.toBe('u1');

    const stored = await TrustedDevices.findOneAsync(device.deviceId);
    expect(stored?.lastUsedAt).toBeTruthy();
    expect(stored!.expiresAt.getTime()).toBeGreaterThan(
      Date.now() + DEVICE_VALID_MS - 60_000
    );
  });

  it('rejects a wrong PIN and counts it', async () => {
    const user = await insertUser();
    const device = await enroll(user, '1234');

    expect(await codeOf(login(device, '1235'))).toBe(
      TrustedDeviceErrorCode.INVALID_PIN
    );
    const stored = await TrustedDevices.findOneAsync(device.deviceId);
    expect(stored?.failedPinAttempts).toBe(1);
  });

  it('clears the count after a good login', async () => {
    const user = await insertUser();
    const device = await enroll(user, '1234');
    await login(device, '9999').catch(() => undefined);
    await login(device, '8888').catch(() => undefined);
    await login(device, '1234');

    const stored = await TrustedDevices.findOneAsync(device.deviceId);
    expect(stored?.failedPinAttempts).toBe(0);
  });

  it('rejects the right PIN with a wrong secret', async () => {
    const user = await insertUser();
    const device = await enroll(user, '1234');

    expect(
      await codeOf(
        loginWithTrustedDevice({
          deviceId: device.deviceId,
          secret: 'f'.repeat(64),
          pin: '1234',
        })
      )
    ).toBe(TrustedDeviceErrorCode.INVALID_PIN);
  });

  it('revokes the device after too many wrong PINs, even for the right one', async () => {
    const user = await insertUser();
    const device = await enroll(user, '1234');

    for (let i = 1; i < MAX_PIN_ATTEMPTS; i += 1) {
      expect(await codeOf(login(device, '0001'))).toBe(
        TrustedDeviceErrorCode.INVALID_PIN
      );
    }
    expect(await codeOf(login(device, '0001'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );

    expect(await codeOf(login(device, '1234'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );
    expect(await logTypes('u1')).toContain(
      SecurityOperationType.TRUSTED_DEVICE_REVOKED
    );
  });

  it('does not let parallel guesses beat the attempt limit', async () => {
    const user = await insertUser();
    const device = await enroll(user, '1234');

    const guesses = Array.from({ length: 20 }, (_, i) =>
      codeOf(login(device, String(i).padStart(4, '0')))
    );
    await Promise.all(guesses);

    const stored = await TrustedDevices.findOneAsync(device.deviceId);
    expect(stored?.failedPinAttempts).toBeLessThanOrEqual(MAX_PIN_ATTEMPTS);
    expect(await codeOf(login(device, '1234'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );
  });

  it('rejects an unknown, expired or removed device', async () => {
    const user = await insertUser();
    expect(
      await codeOf(
        loginWithTrustedDevice({ deviceId: 'nope', secret: 'x', pin: '1234' })
      )
    ).toBe(TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED);

    const expired = await enroll(user);
    await TrustedDevices.updateAsync(expired.deviceId, {
      $set: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await codeOf(login(expired, '1234'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );

    const removed = await enroll(user);
    await removeTrustedDevice({ deviceId: removed.deviceId }, user, 'admin');
    expect(await codeOf(login(removed, '1234'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );
  });

  it('is revoked by a password change', async () => {
    const user = await insertUser();
    const device = await enroll(user);

    await Users.updateAsync(user._id, {
      $set: { 'services.password.bcrypt': 'a-new-hash' },
    });

    expect(await codeOf(login(device, '1234'))).toBe(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED
    );
    const stored = await TrustedDevices.findOneAsync(device.deviceId);
    expect(stored?.revokedReason).toBe('password changed');
  });

  it('keeps users apart', async () => {
    const alice = await insertUser('alice');
    const bob = await insertUser('bob');
    const aliceDevice = await enroll(alice);
    await enroll(bob);

    await expect(login(aliceDevice, '1234')).resolves.toBe('alice');
  });
});

describe('removeTrustedDevice', () => {
  it('only lets users remove their own devices', async () => {
    const alice = await insertUser('alice');
    const bob = await insertUser('bob');
    const device = await enroll(alice);

    expect(
      await codeOf(
        removeTrustedDevice({ deviceId: device.deviceId }, bob, 'admin')
      )
    ).toBe('NOT_FOUND');

    await removeTrustedDevice({ deviceId: device.deviceId }, alice, 'admin');
    expect(await logTypes('alice')).toContain(
      SecurityOperationType.TRUSTED_DEVICE_REMOVED
    );
  });
});

describe('revokeUserTrustedDevices', () => {
  it('revokes every active device of the user and no one else', async () => {
    const alice = await insertUser('alice');
    const bob = await insertUser('bob');
    const a1 = await enroll(alice);
    await enroll(alice);
    const b1 = await enroll(bob);

    const admin = await insertUser('admin');
    await expect(
      revokeUserTrustedDevices({ userId: 'alice' }, admin, 'admin')
    ).resolves.toBe(2);

    expect(
      await codeOf(
        loginWithTrustedDevice({
          deviceId: a1.deviceId,
          secret: a1.deviceSecret,
          pin: '1234',
        })
      )
    ).toBe(TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED);
    await expect(
      loginWithTrustedDevice({
        deviceId: b1.deviceId,
        secret: b1.deviceSecret,
        pin: '1234',
      })
    ).resolves.toBe('bob');
  });
});
