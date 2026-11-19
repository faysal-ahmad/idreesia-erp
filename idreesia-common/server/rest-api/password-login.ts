import { TwoFactorErrorCode } from 'meteor/idreesia-common/constants';
import { TOO_MANY_ATTEMPTS_ERROR } from 'meteor/idreesia-common/server/business-logic/admin/users/login-attempts';

export const ACCOUNT_LOCKED_MESSAGE =
  'Your account is currently locked. Contact an administrator for support.';

export interface LoginCandidate {
  _id: string;
  locked?: boolean;
  services?: {
    password?: unknown;
    twoFactorAuthentication?: { secret?: string; type?: string };
  };
}

export interface LoginInput {
  username?: string;
  email?: string;
  password?: unknown;
  code?: unknown;
}

export interface TokenGrant {
  userId: string;
  token: string;
  tokenExpires: Date;
}

// The effects of a login, injected so the decision order can be tested
// without Meteor's accounts system.
export interface LoginDeps {
  findUser(query: { username: string } | { email: string }): Promise<LoginCandidate | undefined>;
  reserveAttempt(userId: string): Promise<boolean>;
  checkPassword(user: LoginCandidate, password: string): Promise<{ userId: string; error?: unknown }>;
  isTwoFactorEnabled(user: LoginCandidate): boolean;
  consumeTwoFactorCode(userId: string, secret: string, code: string): Promise<boolean>;
  clearAttempts(userId: string): Promise<void>;
  issueToken(userId: string): Promise<{ token: string; tokenExpires: Date }>;
}

export type LoginResult =
  | { status: 200; body: TokenGrant }
  | { status: 400 | 401 | 403 | 429; body?: { error: string } };

/**
 * Exchanges a username/email and password (plus a two-factor code when the
 * account has one) for a login token. The order is deliberate:
 *  1. malformed input (400), unknown user or no password set (401);
 *  2. the throttle (429), counted and refused *before* the password is
 *     checked so a blocked attempt doesn't reveal whether it was right;
 *  3. the password (401);
 *  4. the lock (403), only *after* the password so a locked account isn't
 *     revealed to someone who doesn't know it;
 *  5. two-factor (401), each code usable once.
 * Only a fully successful login clears the attempt count.
 */
export async function passwordLogin(
  input: LoginInput,
  deps: LoginDeps
): Promise<LoginResult> {
  const { username, email, password, code } = input;
  if ((!username && !email) || typeof password !== 'string') {
    return { status: 400 };
  }

  const user = await deps.findUser(username ? { username } : { email: email! });
  if (!user || !user.services?.password) return { status: 401 };

  if (!(await deps.reserveAttempt(user._id))) {
    return { status: 429, body: { error: TOO_MANY_ATTEMPTS_ERROR } };
  }

  const { error, userId } = await deps.checkPassword(user, password);
  if (error) return { status: 401 };

  if (user.locked === true) {
    return { status: 403, body: { error: ACCOUNT_LOCKED_MESSAGE } };
  }

  const secret = user.services.twoFactorAuthentication?.secret;
  if (deps.isTwoFactorEnabled(user) && secret) {
    let twoFactorError: string | null = null;
    if (typeof code !== 'string' || !code) {
      twoFactorError = TwoFactorErrorCode.CODE_REQUIRED;
    } else if (!(await deps.consumeTwoFactorCode(userId, secret, code))) {
      twoFactorError = TwoFactorErrorCode.INVALID_CODE;
    }
    if (twoFactorError) return { status: 401, body: { error: twoFactorError } };
  }

  await deps.clearAttempts(userId);
  const { token, tokenExpires } = await deps.issueToken(userId);
  return { status: 200, body: { userId, token, tokenExpires } };
}
