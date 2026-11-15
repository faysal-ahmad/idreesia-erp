import type { AppUser } from 'meteor/idreesia-common/server/collections/admin';

/**
 * Whether the user has two-factor authentication turned on. Same test as the
 * accounts-2fa package's Accounts._check2faEnabled, which login uses.
 */
export const isTwoFactorEnabled = (user: AppUser | null | undefined) => {
  const twoFactor = user?.services?.twoFactorAuthentication;
  return !!(twoFactor?.secret && twoFactor.type === 'otp');
};
