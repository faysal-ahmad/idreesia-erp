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

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

/**
 * Makes a file URL from the backend (e.g. a photo in object storage) usable
 * on this device. In development the backend builds them from
 * S3_PUBLIC_ENDPOINT=http://localhost:9000, but on a phone "localhost" is the
 * phone itself. When the app reaches the backend by the Mac's LAN address
 * (scripts/run-mobile-device.mjs), point localhost URLs at that address too.
 * Other URLs (Spaces, the CDN) are returned unchanged.
 */
export const toDeviceUrl = <T extends string | null | undefined>(url: T): T => {
  if (!url || !backendUrl) return url;
  try {
    const backendHost = new URL(backendUrl).hostname;
    const parsed = new URL(url);
    if (!LOCAL_HOSTS.has(parsed.hostname) || LOCAL_HOSTS.has(backendHost)) return url;
    parsed.hostname = backendHost;
    return parsed.toString() as T;
  } catch {
    return url;
  }
};

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
