type MeteorCallback = (error?: Meteor.Error | Error | null) => void;

interface Window {
  __meteor_runtime_config__?: MeteorRuntimeConfig;
}

// Meteor exposes this on globalThis in both web and Cordova builds.
declare var __meteor_runtime_config__: MeteorRuntimeConfig | undefined;

interface MeteorRuntimeConfig {
  DDP_DEFAULT_CONNECTION_URL?: string;
  ROOT_URL?: string;
  [key: string]: unknown;
}

declare namespace Meteor {
  interface Error {
    error?: string | number;
    reason?: string;
    details?: string;
    message?: string;
  }

  interface Settings {
    public?: {
      backendUrl?: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }
}

interface MeteorGlobal {
  settings: Meteor.Settings;
  absoluteUrl(path?: string): string;
  startup(callback: () => void): void;
  userId(): string | null;
  isClient: boolean;
  isCordova?: boolean;
  isServer: boolean;
}

declare const Meteor: MeteorGlobal;

declare module 'meteor/meteor' {
  export const Meteor: MeteorGlobal;
}

declare module 'meteor/ddp-client' {
  export interface DDPStatus {
    connected: boolean;
    status: 'connected' | 'connecting' | 'failed' | 'waiting' | 'offline';
    retryCount?: number;
    retryTime?: number;
    reason?: string;
  }

  export interface DDPConnection {
    status(): DDPStatus;
    reconnect(): void;
    disconnect(): void;
  }

  export const DDP: {
    connect(url: string): DDPConnection;
  };
}

declare module 'meteor/accounts-base' {
  import type { DDPConnection } from 'meteor/ddp-client';

  export interface AccountsClientOptions {
    connection: DDPConnection | null;
  }

  export class AccountsClient {
    constructor(options: AccountsClientOptions);
    createUser(
      options: { email?: string; password?: string; username?: string },
      callback?: MeteorCallback
    ): void;
    loginWithPassword(
      user: string | { email?: string; username?: string; id?: string },
      password: string,
      callback?: MeteorCallback
    ): void;
    logout(callback?: MeteorCallback): void;
    userId(): string | null;
  }
}

declare module 'meteor/react-meteor-data' {
  export function useTracker<T>(
    reactiveFn: () => T,
    deps?: import('react').DependencyList
  ): T;
}

declare module 'meteor/idreesia-common/*';
declare module 'meteor/*';
