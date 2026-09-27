import { useTracker } from 'meteor/react-meteor-data';
import type { DDPStatus } from 'meteor/ddp-client';

import { backendAccounts, backendConnection } from '/imports/startup/backend';

export interface AuthState {
  userId: string | null;
  loggingIn: boolean;
  connected: boolean;
  status: DDPStatus['status'] | null;
}

/** Reactive auth and connection state of the backend DDP connection. */
export const useAuthState = (): AuthState =>
  useTracker(() => {
    if (!backendAccounts || !backendConnection) {
      return { userId: null, loggingIn: false, connected: false, status: null };
    }

    const { connected, status } = backendConnection.status();
    return {
      userId: backendAccounts.userId(),
      loggingIn: backendAccounts.loggingIn(),
      connected,
      status,
    };
  }, []);
