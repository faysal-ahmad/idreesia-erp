import { Accounts } from 'meteor/accounts-base';

import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { Users } from 'meteor/idreesia-common/server/collections/admin';

import { TOO_MANY_ATTEMPTS_MESSAGE } from './login-attempts';
import { allowRegistration } from './registration-limit';

/**
 * Creates a locked account for the email address and sends it an enrollment
 * email to set a password. Self-registered accounts can't sign in until an
 * administrator unlocks them (see
 * idreesia-web/imports/startup/server/account-lock.ts).
 */
export async function registerUser(
  { displayName, email }: { displayName: string; email: string },
  clientAddress: string | null | undefined
): Promise<number> {
  if (!allowRegistration(clientAddress || 'unknown')) {
    throw new Error(TOO_MANY_ATTEMPTS_MESSAGE);
  }

  // The account is created already locked: one transaction.
  const userId = await runInTransaction(async () => {
    const user = await Accounts.findUserByEmail(email);
    if (user) {
      throw new Error('This email address is already registered.');
    }

    const newUserId = await Accounts.createUserAsync({
      email,
      profile: {
        name: displayName,
      },
    });
    if (newUserId) {
      await Users.updateAsync(newUserId, { $set: { locked: true } });
    }
    return newUserId;
  });

  // Only once the account is committed: the email carries a token stored on
  // it.
  if (userId) await Accounts.sendEnrollmentEmail(userId);

  return 1;
}
