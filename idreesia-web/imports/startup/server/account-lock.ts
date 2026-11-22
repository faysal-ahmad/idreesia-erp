import { Accounts } from 'meteor/accounts-base';

import {
  ACCOUNT_LOCKED_MESSAGE,
  SERVICE_ACCOUNT_MESSAGE,
} from 'meteor/idreesia-common/server/rest-api/password-login';

// A locked account, or a service account, cannot sign in. Self-registered accounts start out locked
// (registerUser) until an administrator unlocks them in Admin → Users.

// Meteor.Error code clients can test for (the set-password page shows its own
// wording for it). Mirrored in the web set-initial-password form.
export const ACCOUNT_LOCKED_ERROR = 'account-locked';

// Meteor.Error code for an attempt to log in to a service account.
export const SERVICE_ACCOUNT_ERROR = 'service-account';

interface LockableUser {
  locked?: boolean;
  isServiceAccount?: boolean;
}

export const isAccountLocked = (user: LockableUser | null | undefined) =>
  user?.locked === true;

// Covers every Meteor login: password login (web and mobile), the automatic
// login after setting a password from the enrollment or reset email, and
// resuming a session with a stored token. The REST /login endpoint and the
// GraphQL/REST token lookup (get-user.ts) check the lock separately.
//
// Only already-successful attempts are rejected, so a wrong password still
// gets the usual error and doesn't reveal whether the account is locked.
Accounts.validateLoginAttempt(attempt => {
  if (attempt.allowed && isAccountLocked(attempt.user)) {
    throw new Meteor.Error(ACCOUNT_LOCKED_ERROR, ACCOUNT_LOCKED_MESSAGE);
  }
  if (attempt.allowed && attempt.user?.isServiceAccount === true) {
    throw new Meteor.Error(SERVICE_ACCOUNT_ERROR, SERVICE_ACCOUNT_MESSAGE);
  }
  return attempt.allowed;
});
