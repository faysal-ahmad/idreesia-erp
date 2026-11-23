import { createHash, randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { GraphQLError } from 'graphql';

import {
  TRUSTED_DEVICE_PIN_LENGTH,
  TrustedDeviceErrorCode,
} from 'meteor/idreesia-common/constants';
import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import {
  TrustedDevices,
  Users,
  type TrustedDeviceDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { requireFreshTwoFactorCode } from './two-factor';

// Trusted-device PIN login. After a password login (and, with two-factor on,
// a fresh code) the user enrolls the device with a PIN. The server returns a
// random device secret once, which the app keeps in the phone's secure
// storage; the PIN is never kept on the device. Afterwards the device, even
// logged out, signs in with its id, its secret and the PIN.
//
// A PIN has few combinations, so the protection is mostly elsewhere:
//  - Only a hash of the secret and the PIN together is stored, so a leaked
//    database can't be used to guess PINs, and a stolen secret is no use
//    without the PIN.
//  - Wrong PINs are counted on the server, before the PIN is checked, in one
//    atomic write. MAX_PIN_ATTEMPTS wrong ones in a row revoke the device,
//    and the user has to log in with the password again.
//  - A new password revokes every device (the fingerprint of the password it
//    was enrolled with no longer matches). A locked account can't log in this
//    way either, because Meteor's validateLoginAttempt covers every login.
//  - A device unused for DEVICE_VALID_MS expires.

export const MAX_PIN_ATTEMPTS = 5;
export const DEVICE_VALID_MS = 180 * 24 * 60 * 60 * 1000;
/** How long an expired or revoked device stays on record before it is deleted. */
export const KEEP_REVOKED_MS = 30 * 24 * 60 * 60 * 1000;
export const MAX_DEVICES_PER_USER = 5;

const SALT_BYTES = 16;
const SECRET_BYTES = 32;
const KEY_BYTES = 64;

interface UserRef {
  _id: string;
}

export interface EnrolledTrustedDevice {
  deviceId: string;
  /** Shown once: the server keeps only a hash. */
  deviceSecret: string;
}

const deviceError = (code: string, message: string) =>
  new GraphQLError(message, { extensions: { code } });

const deriveKey = (secret: string, pin: string, salt: string) =>
  new Promise<Buffer>((resolve, reject) => {
    scrypt(`${secret}:${pin}`, salt, KEY_BYTES, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });

/** A short fingerprint of the user's password hash, to notice a new password. */
export const getPasswordFingerprint = (
  user:
    | { services?: { password?: { bcrypt?: unknown } }; [key: string]: unknown }
    | null
    | undefined
): string | null => {
  const bcrypt = user?.services?.password?.bcrypt;
  return typeof bcrypt === 'string'
    ? createHash('sha256').update(bcrypt).digest('hex')
    : null;
};

const isValidPin = (pin: unknown): pin is string =>
  typeof pin === 'string' &&
  new RegExp(`^\\d{${TRUSTED_DEVICE_PIN_LENGTH}}$`).test(pin);

const isActive = (device: TrustedDeviceDocument, now: Date) =>
  !device.revokedAt && device.expiresAt > now;

const keepUntilRevokedRemoval = (now: Date) =>
  new Date(now.getTime() + KEEP_REVOKED_MS);

async function logOperation(
  userId: string,
  operationType: string,
  operationBy: string,
  dataSource: string,
  dataSourceDetail: string | null
) {
  await SecurityLogs.insertAsync({
    userId,
    operationType,
    operationBy,
    operationTime: new Date(),
    dataSource,
    dataSourceDetail,
  });
}

async function revokeDevice(
  device: TrustedDeviceDocument,
  reason: string,
  operationBy: string,
  dataSource: string,
  operationType: string = SecurityOperationType.TRUSTED_DEVICE_REVOKED
) {
  const now = new Date();
  const revoked = await TrustedDevices.updateAsync(
    { _id: device._id, revokedAt: null },
    {
      $set: {
        revokedAt: now,
        revokedReason: reason,
        removeAt: keepUntilRevokedRemoval(now),
      },
    }
  );
  if (revoked > 0) {
    await logOperation(
      device.userId,
      operationType,
      operationBy,
      dataSource,
      `${device.name || device._id}: ${reason}`
    );
  }
}

/**
 * Trusts the device the user is logged in on: stores a hash of a new secret
 * and the PIN and returns the secret for the app to keep. Passing
 * `replaceDeviceId` (the device's current id) swaps the old credential out,
 * which is how the PIN is changed. The user's oldest devices are removed past
 * MAX_DEVICES_PER_USER. With two-factor on, a fresh code is required.
 */
export async function enrollTrustedDevice(
  {
    pin,
    name,
    code,
    replaceDeviceId,
  }: {
    pin: string;
    name?: string | null;
    code?: string | null;
    replaceDeviceId?: string | null;
  },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<EnrolledTrustedDevice> {
  if (!isValidPin(pin)) {
    throw deviceError(
      'BAD_USER_INPUT',
      `The PIN must be ${TRUSTED_DEVICE_PIN_LENGTH} digits.`
    );
  }
  const existingUser = await Users.findOneAsync(user._id);
  if (!existingUser) throw deviceError('NOT_FOUND', 'User not found.');

  // Throws for a missing or wrong code. The attempt count is kept even if
  // the enrollment below fails.
  await requireFreshTwoFactorCode(existingUser, code);

  const deviceId = randomBytes(16).toString('hex');
  const deviceSecret = randomBytes(SECRET_BYTES).toString('hex');
  const salt = randomBytes(SALT_BYTES).toString('hex');
  const hash = (await deriveKey(deviceSecret, pin, salt)).toString('hex');

  await runInTransaction(async () => {
    const now = new Date();

    if (replaceDeviceId) {
      await TrustedDevices.removeAsync({
        _id: replaceDeviceId,
        userId: user._id,
      });
    }

    const devices = await TrustedDevices.find({ userId: user._id }).fetchAsync();
    const active = devices
      .filter(device => isActive(device, now))
      .sort(
        (a, b) =>
          (a.lastUsedAt ?? a.createdAt).getTime() -
          (b.lastUsedAt ?? b.createdAt).getTime()
      );
    const overflow = active.slice(
      0,
      Math.max(0, active.length - (MAX_DEVICES_PER_USER - 1))
    );
    for (const device of overflow) {
      await revokeDevice(
        device,
        'replaced by a newer device',
        user._id,
        dataSource
      );
    }

    const expiresAt = new Date(now.getTime() + DEVICE_VALID_MS);
    await TrustedDevices.insertAsync({
      _id: deviceId,
      userId: user._id,
      name: name?.trim().slice(0, 100) || null,
      salt,
      hash,
      passwordFingerprint: getPasswordFingerprint(existingUser),
      failedPinAttempts: 0,
      createdAt: now,
      lastUsedAt: null,
      expiresAt,
      revokedAt: null,
      revokedReason: null,
      removeAt: new Date(expiresAt.getTime() + KEEP_REVOKED_MS),
    });
    await logOperation(
      user._id,
      SecurityOperationType.TRUSTED_DEVICE_ENROLLED,
      user._id,
      dataSource,
      dataSourceDetail ?? name ?? deviceId
    );
  });

  return { deviceId, deviceSecret };
}

/**
 * Checks a device login and returns the id of the user to log in. Throws a
 * GraphQLError whose `extensions.code` is a TrustedDeviceErrorCode:
 * DEVICE_NOT_TRUSTED when the device is unknown, removed, expired or revoked
 * (the app then forgets it), INVALID_PIN for a wrong PIN.
 */
export async function loginWithTrustedDevice({
  deviceId,
  secret,
  pin,
}: {
  deviceId: string;
  secret: string;
  pin: string;
}): Promise<string> {
  const notTrusted = () =>
    deviceError(
      TrustedDeviceErrorCode.DEVICE_NOT_TRUSTED,
      'This device is no longer trusted. Please log in with your password.'
    );

  if (
    typeof deviceId !== 'string' ||
    typeof secret !== 'string' ||
    !isValidPin(pin)
  ) {
    throw deviceError(
      TrustedDeviceErrorCode.INVALID_PIN,
      'Incorrect PIN.'
    );
  }

  const device = await TrustedDevices.findOneAsync(deviceId);
  const now = new Date();
  if (!device || !isActive(device, now)) throw notTrusted();

  const user = await Users.findOneAsync(device.userId, {
    fields: { services: 1 },
  });
  if (!user) throw notTrusted();
  if (device.passwordFingerprint !== getPasswordFingerprint(user)) {
    await revokeDevice(
      device,
      'password changed',
      device.userId,
      'system'
    );
    throw notTrusted();
  }

  // Counted before the PIN is checked, and only while under the limit, so a
  // burst of parallel guesses can't all slip through.
  const reserved = await TrustedDevices.updateAsync(
    {
      _id: device._id,
      revokedAt: null,
      failedPinAttempts: { $lt: MAX_PIN_ATTEMPTS },
    },
    { $inc: { failedPinAttempts: 1 } }
  );
  if (reserved === 0) {
    await revokeDevice(device, 'too many wrong PINs', device.userId, 'system');
    throw notTrusted();
  }

  const expected = Buffer.from(device.hash, 'hex');
  const actual = await deriveKey(secret, pin, device.salt);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    const attempts = device.failedPinAttempts + 1;
    if (attempts >= MAX_PIN_ATTEMPTS) {
      await revokeDevice(
        device,
        'too many wrong PINs',
        device.userId,
        'system'
      );
      throw notTrusted();
    }
    throw deviceError(
      TrustedDeviceErrorCode.INVALID_PIN,
      `Incorrect PIN. ${MAX_PIN_ATTEMPTS - attempts} attempts left.`
    );
  }

  await TrustedDevices.updateAsync(device._id, {
    $set: {
      failedPinAttempts: 0,
      lastUsedAt: now,
      expiresAt: new Date(now.getTime() + DEVICE_VALID_MS),
      removeAt: new Date(now.getTime() + DEVICE_VALID_MS + KEEP_REVOKED_MS),
    },
  });
  return device.userId;
}

/** The user stops trusting one of their devices. */
export async function removeTrustedDevice(
  { deviceId }: { deviceId: string },
  user: UserRef,
  dataSource: string
): Promise<void> {
  await runInTransaction(async () => {
    const device = await TrustedDevices.findOneAsync({
      _id: deviceId,
      userId: user._id,
    });
    if (!device) throw deviceError('NOT_FOUND', 'Device not found.');
    await revokeDevice(
      device,
      'removed by the user',
      user._id,
      dataSource,
      SecurityOperationType.TRUSTED_DEVICE_REMOVED
    );
  });
}

/** Stops trusting every device of a user (an administrator's action). */
export async function revokeUserTrustedDevices(
  { userId }: { userId: string },
  user: UserRef,
  dataSource: string
): Promise<number> {
  return runInTransaction(async () => {
    const now = new Date();
    const devices = await TrustedDevices.find({ userId }).fetchAsync();
    const active = devices.filter(device => isActive(device, now));
    for (const device of active) {
      await revokeDevice(device, 'revoked by an administrator', user._id, dataSource);
    }
    return active.length;
  });
}
