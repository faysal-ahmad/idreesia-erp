import { Accounts } from 'meteor/accounts-base';

import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';
import {
  clearLoginAttempts,
  consumeTwoFactorCode,
  isTwoFactorEnabled,
  reserveLoginAttempt,
  TOO_MANY_ATTEMPTS_ERROR,
  TOO_MANY_ATTEMPTS_MESSAGE,
} from 'meteor/idreesia-common/server/business-logic/admin';
import type { AppUser } from 'meteor/idreesia-common/server/collections/admin';

import { getThrottleAddress } from './client-address';

// Throttles the Meteor password login (web and mobile) per account and client
// address (login-attempts.ts), and makes its two-factor codes single-use, the
// same as the REST /login endpoint does (setup-rest-endpoints.ts). Meteor's own rate limit on the login method is
// per connection, so a client that reconnects gets around it.
//
// Login hooks (validateLoginAttempt, onLoginFailure) are synchronous and
// can't wait on the database, so this wraps accounts-password's "password"
// login handler instead: the attempt is counted before the handler checks the
// password, and only a fully successful login (password and, when on, a
// fresh two-factor code) clears the count. A blocked attempt is refused
// before the password is checked, so it doesn't reveal whether the password
// was right.

interface LoginHandler {
  name: string | null;
  handler: (this: unknown, options: Record<string, unknown>) => unknown;
}

interface PasswordLoginOptions extends Record<string, unknown> {
  user?: unknown;
  password?: unknown;
  code?: unknown;
}

// The method invocation login handlers run as. clientAddress comes from
// X-Forwarded-For and HTTP_FORWARDED_COUNT (see client-address.ts).
interface LoginInvocation {
  connection?: { clientAddress?: string | null } | null;
}

interface LoginResult {
  userId?: string;
  error?: unknown;
}

interface AccountsPrivateApi {
  _loginHandlers: LoginHandler[];
  _findUserByQuery(
    query: unknown,
    options: { fields: Record<string, number> }
  ): Promise<AppUser | null>;
}
const AccountsPrivate = Accounts as unknown as AccountsPrivateApi;

// What registerLoginHandler wraps each handler in; missing from the types.
const { wrapFn } = Meteor as unknown as {
  wrapFn<T extends (...args: never[]) => unknown>(fn: T): T;
};

// The client sends { username }, { email } or { id }; anything else is left
// to the password handler's own validation.
const isUserQuery = (query: unknown) =>
  !!query &&
  typeof query === 'object' &&
  Object.values(query).every(value => typeof value === 'string');

const passwordHandler = AccountsPrivate._loginHandlers.find(
  ({ name }) => name === 'password'
);
if (!passwordHandler) {
  throw new Error('accounts-password login handler not found.');
}

const checkPassword = passwordHandler.handler;
passwordHandler.handler = wrapFn(async function throttledPasswordLogin(
  this: unknown,
  options: PasswordLoginOptions
) {
  // Not a password login, or a malformed one: the handler deals with it.
  if (!options.password || !isUserQuery(options.user)) {
    return checkPassword.call(this, options);
  }

  const user = await AccountsPrivate._findUserByQuery(options.user, {
    fields: { services: 1 },
  });
  if (!user) return checkPassword.call(this, options);

  const clientAddress = getThrottleAddress(
    (this as LoginInvocation | undefined)?.connection?.clientAddress
  );
  if (!(await reserveLoginAttempt(user._id, clientAddress))) {
    throw new Meteor.Error(TOO_MANY_ATTEMPTS_ERROR, TOO_MANY_ATTEMPTS_MESSAGE);
  }

  // Throws for a missing or invalid two-factor code.
  const result = (await checkPassword.call(this, options)) as LoginResult;
  if (!result || result.error) return result;

  // The handler accepted the code; also refuse one that was already used.
  if (
    isTwoFactorEnabled(user) &&
    !(await consumeTwoFactorCode(
      user._id,
      user.services.twoFactorAuthentication.secret,
      String(options.code)
    ))
  ) {
    throw new Meteor.Error(
      TwoFactorErrorCode.INVALID_CODE,
      'Invalid 2FA code'
    );
  }

  await clearLoginAttempts(user._id, clientAddress);
  return result;
}) as LoginHandler['handler'];
