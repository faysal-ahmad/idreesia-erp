import { Accounts } from 'meteor/accounts-base';

import { backendAccounts } from '/imports/startup/backend';
import { apolloClient } from '/imports/startup/apollo-client';

// Promise wrappers for the account operations the mobile app performs against
// the backend connection. accounts-password only wires loginWithPassword,
// changePassword and forgotPassword to the default connection, so these
// mirror its client code (packages/accounts-password/password_client.js)
// against backendAccounts instead.

const requireAccounts = () => {
  if (!backendAccounts) {
    throw new Error('The backend URL is not configured.');
  }
  return backendAccounts;
};

const toPromise = (
  run: (callback: (error?: Meteor.Error | Error | null, result?: unknown) => void) => void
) =>
  new Promise<unknown>((resolve, reject) => {
    run((error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });

export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error && typeof error === 'object') {
    const { reason, message } = error as { reason?: string; message?: string };
    return reason || message || fallback;
  }
  return fallback;
};

/** Logs in with either an email address or a username, like the web app. */
export const loginWithPassword = async (
  userNameOrEmail: string,
  password: string
) => {
  const accounts = requireAccounts();
  const trimmed = userNameOrEmail.trim();
  const user = trimmed.includes('@') ? { email: trimmed } : { username: trimmed };

  await toPromise((callback) =>
    accounts.callLoginMethod({
      methodArguments: [{ user, password: Accounts._hashPassword(password) }],
      userCallback: callback,
    })
  );
};

export const logout = async () => {
  const accounts = requireAccounts();
  await toPromise((callback) => accounts.logout(callback));
  await apolloClient.clearStore();
};

/** Sends a reset-password email. The link in it opens the web app. */
export const forgotPassword = async (email: string) => {
  const accounts = requireAccounts();
  await toPromise((callback) =>
    accounts.connection.call('forgotPassword', { email: email.trim() }, callback)
  );
};

/**
 * Changes the signed-in user's password. The server also revokes every other
 * login token for the user, so other devices and the web are signed out.
 */
export const changePassword = async (oldPassword: string, newPassword: string) => {
  const accounts = requireAccounts();
  const result = await toPromise((callback) =>
    accounts.connection.apply(
      'changePassword',
      [Accounts._hashPassword(oldPassword), Accounts._hashPassword(newPassword)],
      callback
    )
  );

  if (!result) {
    throw new Error('No result from changePassword.');
  }
};
