import { Accounts } from 'meteor/accounts-base';

import { TrustedDeviceErrorCode } from 'meteor/idreesia-common/constants';
import { loginWithTrustedDevice } from 'meteor/idreesia-common/server/business-logic/admin';

// The login of a device enrolled for PIN login (mobile). The client sends
// { trustedDevice: { deviceId, secret, pin } } to the standard login method.
// The checks, and the counting of wrong PINs, are in
// business-logic/admin/users/trusted-devices.ts.
//
// A locked or service account is refused afterwards by the
// Accounts.validateLoginAttempt hook in account-lock.ts, which covers every
// login handler.

interface TrustedDeviceLoginOptions extends Record<string, unknown> {
  trustedDevice?: {
    deviceId?: unknown;
    secret?: unknown;
    pin?: unknown;
  };
}

const KNOWN_CODES = new Set<string>(Object.values(TrustedDeviceErrorCode));

// registerLoginHandler is missing from the project's Accounts types.
const accountsWithLoginHandlers = Accounts as unknown as {
  registerLoginHandler(
    name: string,
    handler: (
      options: TrustedDeviceLoginOptions
    ) => Promise<{ userId: string } | undefined>
  ): void;
};
const registerLoginHandler =
  accountsWithLoginHandlers.registerLoginHandler.bind(Accounts);

registerLoginHandler(
  'trustedDevice',
  async (options: TrustedDeviceLoginOptions) => {
    // Not a trusted-device login: another handler takes it.
    if (!options?.trustedDevice) return undefined;

    const { deviceId, secret, pin } = options.trustedDevice;
    try {
      const userId = await loginWithTrustedDevice({
        deviceId: deviceId as string,
        secret: secret as string,
        pin: pin as string,
      });
      return { userId };
    } catch (error) {
      const code = (error as { extensions?: { code?: string } }).extensions
        ?.code;
      if (code && KNOWN_CODES.has(code)) {
        throw new Meteor.Error(code, (error as Error).message);
      }
      throw error;
    }
  }
);
