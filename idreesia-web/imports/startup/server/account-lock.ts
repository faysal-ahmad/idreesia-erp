import { Accounts } from 'meteor/accounts-base';

import { ACCOUNT_LOCKED_MESSAGE } from 'meteor/idreesia-common/server/rest-api/password-login';

// A locked account cannot sign in. Self-registered accounts start out locked
// (registerUser) until an administrator unlocks them in Admin → Users.

// Meteor.Error code clients can test for (the set-password page shows its own
// wording for it). Mirrored in the web set-initial-password form.
export const ACCOUNT_LOCKED_ERROR = 'account-locked';

interface LockableUser {
  locked?: boolean;
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
  return attempt.allowed;
});
