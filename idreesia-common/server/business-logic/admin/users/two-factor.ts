import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode-svg';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  Users,
  type AppUser,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import {
  AttemptKind,
  clearAttempts,
  reserveAttempt,
  TOO_MANY_ATTEMPTS_MESSAGE,
} from './login-attempts';
import { findOneUser, type MappedUser } from './map-user';
import { isSuperAdmin } from './super-admin';
import { isTwoFactorEnabled } from './two-factor-status';

// Optional per-user two-factor authentication with an authenticator app
// (TOTP). The accounts-2fa Meteor package enforces the code on password login
// and stores its data in services.twoFactorAuthentication = { secret, type }.
// Setup and teardown happen here instead of through the package's own methods
// so they are audited and disabling needs a current code. The settings below
// must stay the same as the package's (packages/accounts-2fa/2fa-server.js),
// or codes accepted here would be rejected at login.
const TOTP_ALGORITHM = 'SHA1';
const TOTP_DIGITS = 6;
const TOTP_PERIOD = 30;
const TOTP_WINDOW = 10;
const TOTP_SECRET_SIZE = 20;

export const TWO_FACTOR_ISSUER = 'Eastern Breeze ERP';

interface UserRef {
  _id: string;
}

export interface TwoFactorSetup {
  qrCodeSvg: string;
  secret: string;
  uri: string;
}

const getTotp = (secret: string | OTPAuth.Secret, label = 'OTPAuth') =>
  new OTPAuth.TOTP({
    issuer: TWO_FACTOR_ISSUER,
    label,
    secret:
      typeof secret === 'string' ? OTPAuth.Secret.fromBase32(secret) : secret,
    algorithm: TOTP_ALGORITHM,
    digits: TOTP_DIGITS,
    period: TOTP_PERIOD,
  });

/**
 * The time step (30-second period since the epoch) a code from the
 * authenticator app belongs to, or null if it isn't valid now.
 */
const matchTwoFactorCode = (
  secret: string,
  code: string,
  timestamp = Date.now()
): number | null => {
  try {
    const delta = getTotp(secret).validate({
      token: code.replace(/\W+/g, ''),
      timestamp,
      window: TOTP_WINDOW,
    });
    return delta === null
      ? null
      : Math.floor(timestamp / 1000 / TOTP_PERIOD) + delta;
  } catch {
    return null;
  }
};

/** Checks a code from the authenticator app against a base32 secret. */
export const isTwoFactorCodeValid = (secret: string, code: string) =>
  matchTwoFactorCode(secret, code) !== null;

/**
 * Checks a code from the authenticator app and uses it up: a code is accepted
 * only if it is newer than the last one the user used, so a code seen by
 * someone else can't be replayed within its validity window.
 */
export async function consumeTwoFactorCode(
  userId: string,
  secret: string,
  code: string
): Promise<boolean> {
  const step = matchTwoFactorCode(secret, code);
  if (step === null) return false;

  const lastUsedStepField = 'services.twoFactorAuthentication.lastUsedStep';
  const updated = await Users.updateAsync(
    {
      _id: userId,
      'services.twoFactorAuthentication.secret': secret,
      $or: [
        { [lastUsedStepField]: { $exists: false } },
        { [lastUsedStepField]: { $lt: step } },
      ],
    },
    { $set: { [lastUsedStepField]: step } }
  );
  return updated > 0;
}

/**
 * Throttles and checks a code entered while logged in (to enable or disable
 * two-factor). Throws when attempts are blocked or the code is wrong.
 */
async function checkCodeEnteredByUser(
  userId: string,
  secret: string,
  code: string
) {
  if (!(await reserveAttempt(userId, AttemptKind.TWO_FACTOR_CODE))) {
    throw new Error(TOO_MANY_ATTEMPTS_MESSAGE);
  }
  if (!(await consumeTwoFactorCode(userId, secret, code))) {
    throw new Error('Invalid verification code.');
  }
  await clearAttempts(userId, AttemptKind.TWO_FACTOR_CODE);
}

async function getUser(userId: string): Promise<AppUser> {
  const user = await Users.findOneAsync(userId);
  if (!user) throw new Error('User not found.');
  return user;
}

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

/**
 * Creates a new secret for the user and returns it with a QR code to scan.
 * Two-factor stays off (login is unaffected) until enableTwoFactor confirms a
 * code from the app. Starting again replaces an unconfirmed secret.
 */
export async function startTwoFactorSetup(
  user: UserRef
): Promise<TwoFactorSetup> {
  const existingUser = await getUser(user._id);
  if (isTwoFactorEnabled(existingUser)) {
    throw new Error('Two-factor authentication is already enabled.');
  }

  const secret = new OTPAuth.Secret({ size: TOTP_SECRET_SIZE });
  const label =
    existingUser.username || existingUser.emails?.[0]?.address || user._id;
  const uri = getTotp(secret, label).toString();

  await Users.updateAsync(user._id, {
    $set: { 'services.twoFactorAuthentication': { secret: secret.base32 } },
  });

  return {
    qrCodeSvg: new QRCode({
      content: uri,
      padding: 2,
      join: true,
      container: 'svg-viewbox',
      xmlDeclaration: false,
    }).svg(),
    secret: secret.base32,
    uri,
  };
}

/**
 * Turns two-factor on once the user proves the app produces valid codes, and
 * signs the user out everywhere else: sessions started before two-factor was
 * on never passed it. `currentLoginTokenHash` is the hashed login token of the
 * request making the change, which stays valid.
 */
export async function enableTwoFactor(
  {
    code,
    currentLoginTokenHash,
  }: { code: string; currentLoginTokenHash?: string | null },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  const existingUser = await getUser(user._id);
  if (isTwoFactorEnabled(existingUser)) {
    throw new Error('Two-factor authentication is already enabled.');
  }

  const secret = existingUser.services?.twoFactorAuthentication?.secret;
  if (!secret) {
    throw new Error('Start the two-factor setup first.');
  }
  await checkCodeEnteredByUser(user._id, secret, code);

  // The attempt bookkeeping above is kept even if this fails; the change
  // and its security log are one transaction.
  return runInTransaction(async () => {
    await Users.updateAsync(user._id, {
      $set: { 'services.twoFactorAuthentication.type': 'otp' },
      $pull: {
        'services.resume.loginTokens': currentLoginTokenHash
          ? { hashedToken: { $ne: currentLoginTokenHash } }
          : {},
      },
    });
    await logOperation(
      user._id,
      SecurityOperationType.TWO_FACTOR_ENABLED,
      user._id,
      dataSource,
      dataSourceDetail
    );

    return findOneUser(user._id);
  });
}

/** The user turns two-factor off; needs a current code from the app. */
export async function disableTwoFactor(
  { code }: { code: string },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  const existingUser = await getUser(user._id);
  if (!isTwoFactorEnabled(existingUser)) {
    throw new Error('Two-factor authentication is not enabled.');
  }
  await checkCodeEnteredByUser(
    user._id,
    existingUser.services.twoFactorAuthentication.secret,
    code
  );

  // The attempt bookkeeping above is kept even if this fails; the change
  // and its security log are one transaction.
  return runInTransaction(async () => {
    await Users.updateAsync(user._id, {
      $unset: { 'services.twoFactorAuthentication': '' },
    });
    await logOperation(
      user._id,
      SecurityOperationType.TWO_FACTOR_DISABLED,
      user._id,
      dataSource,
      dataSourceDetail
    );

    return findOneUser(user._id);
  });
}

/**
 * A super admin turns two-factor off for a user who lost their device.
 * The only recovery path, since there are no backup codes. Only a super
 * admin can do it: with the password alone the account is then open.
 */
export async function resetTwoFactor(
  { userId }: { userId: string },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
  return runInTransaction(async () => {
    const caller = await Users.findOneAsync(user._id);
    if (!isSuperAdmin(caller)) {
      throw new Error('Only a super admin can reset two-factor authentication.');
    }

    const existingUser = await getUser(userId);
    if (!existingUser.services?.twoFactorAuthentication) {
      return findOneUser(userId);
    }

    await Users.updateAsync(userId, {
      $unset: { 'services.twoFactorAuthentication': '' },
    });
    await logOperation(
      userId,
      SecurityOperationType.TWO_FACTOR_RESET,
      user._id,
      dataSource,
      dataSourceDetail
    );

    return findOneUser(userId);
  });
}
