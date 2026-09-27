import { AccountsClient, type CallLoginMethodOptions } from 'meteor/accounts-base';
import { DDP, type DDPConnection } from 'meteor/ddp-client';
import { Meteor } from 'meteor/meteor';

// The mobile app has no database of its own. Accounts go over a dedicated DDP
// connection to idreesia-web, and data goes over that server's /graphql
// endpoint (see apollo-client.ts).

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const settingsUrl = Meteor.settings.public?.backendUrl;
const runtimeUrl = globalThis.__meteor_runtime_config__?.DDP_DEFAULT_CONNECTION_URL;

export const backendUrl = trimTrailingSlash(settingsUrl || runtimeUrl || '');

/**
 * accounts-base finishes a successful login by waiting for the global
 * Meteor.userAsync() to return a user before it clears loggingIn() and runs
 * the callback. That reads the app's default connection, so for a client on
 * any other connection it never resolves: loggingIn() sticks at true and the
 * login callback never fires. This finishes the login once the result is in.
 * makeClientLoggedIn (token storage + userId) runs synchronously right after
 * validateResult returns, so it has happened by the next microtask.
 *
 * Overriding the method (rather than patching an instance) matters: the
 * constructor already calls it to resume a stored session.
 */
class BackendAccountsClient extends AccountsClient {
  callLoginMethod(options: CallLoginMethodOptions) {
    let finished = false;
    const finish = (error?: Meteor.Error | Error | null, result?: unknown) => {
      if (finished) return;
      finished = true;
      options.userCallback?.(error, result);
    };

    super.callLoginMethod({
      ...options,
      validateResult: result => {
        options.validateResult?.(result);
        queueMicrotask(() => {
          this._setLoggingIn(false);
          finish(undefined, result);
        });
      },
      // Still used by accounts-base on the error path.
      userCallback: finish,
    });
  }
}

export const backendConnection: DDPConnection | null = backendUrl
  ? DDP.connect(backendUrl)
  : null;

// Stores its login token in localStorage under keys namespaced by the backend
// URL, and resumes that session automatically on startup.
export const backendAccounts: AccountsClient | null = backendConnection
  ? new BackendAccountsClient({ connection: backendConnection })
  : null;

/**
 * URL of a stored attachment (e.g. a person's photo) on the backend. The web's
 * getDownloadUrl() uses the page's own origin, which on mobile is the app,
 * not the backend.
 */
export const getBackendFileUrl = (attachmentId?: string | null) =>
  attachmentId ? `${backendUrl}/download-file?attachmentId=${attachmentId}` : undefined;
