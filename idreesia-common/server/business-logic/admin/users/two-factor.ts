import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode-svg';

import { SecurityOperationType } from 'meteor/idreesia-common/constants/audit';
import {
  Users,
  type AppUser,
} from 'meteor/idreesia-common/server/collections/admin';
import { SecurityLogs } from 'meteor/idreesia-common/server/collections/common';

import { findOneUser, type MappedUser } from './map-user';
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

/** Checks a code from the authenticator app against a base32 secret. */
export const isTwoFactorCodeValid = (secret: string, code: string) => {
  try {
    return (
      getTotp(secret).validate({
        token: code.replace(/\W+/g, ''),
        window: TOTP_WINDOW,
      }) !== null
    );
  } catch {
    return false;
  }
};

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

/** Turns two-factor on once the user proves the app produces valid codes. */
export async function enableTwoFactor(
  { code }: { code: string },
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
  if (!isTwoFactorCodeValid(secret, code)) {
    throw new Error('Invalid verification code.');
  }

  await Users.updateAsync(user._id, {
    $set: { 'services.twoFactorAuthentication': { secret, type: 'otp' } },
  });
  await logOperation(
    user._id,
    SecurityOperationType.TWO_FACTOR_ENABLED,
    user._id,
    dataSource,
    dataSourceDetail
  );

  return findOneUser(user._id);
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
  if (
    !isTwoFactorCodeValid(
      existingUser.services.twoFactorAuthentication.secret,
      code
    )
  ) {
    throw new Error('Invalid verification code.');
  }

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
}

/**
 * An administrator turns two-factor off for a user who lost their device.
 * The only recovery path, since there are no backup codes.
 */
export async function resetTwoFactor(
  { userId }: { userId: string },
  user: UserRef,
  dataSource: string,
  dataSourceDetail: string | null = null
): Promise<MappedUser> {
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
}
