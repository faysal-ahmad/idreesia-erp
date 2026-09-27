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
    private?: {
      [key: string]: unknown;
    };
    [key: string]: unknown;
  }
}

interface MeteorGlobal {
  settings: Meteor.Settings;
  absoluteUrl(path?: string): string;
  startup(callback: () => void): void;
  bindEnvironment<TArgs extends unknown[], TReturn>(
    callback: (...args: TArgs) => TReturn
  ): (...args: TArgs) => TReturn;
  userId(): string | null;
  isClient: boolean;
  isCordova?: boolean;
  isServer: boolean;
  users: import('meteor/mongo').Mongo.Collection<{
    _id: string;
    username?: string;
    [key: string]: unknown;
  }>;
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
    call(name: string, ...args: unknown[]): void;
    apply(
      name: string,
      args: unknown[],
      callback?: (error?: Meteor.Error | Error | null, result?: unknown) => void
    ): void;
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

  export interface CallLoginMethodOptions {
    methodName?: string;
    methodArguments: unknown[];
    validateResult?(result: unknown): void;
    userCallback?(error?: Meteor.Error | Error | null, result?: unknown): void;
    _suppressLoggingIn?: boolean;
  }

  export interface HashedPassword {
    digest: string;
    algorithm: 'sha-256';
  }

  export class AccountsClient {
    constructor(options: AccountsClientOptions);
    // Password helpers (loginWithPassword, changePassword, forgotPassword) are
    // only attached to the global Accounts / Meteor for the default connection,
    // so a custom-connection client has to go through callLoginMethod and
    // connection.call itself.
    connection: DDPConnection;
    logout(callback?: MeteorCallback): void;
    logoutOtherClients(callback?: MeteorCallback): void;
    userId(): string | null;
    loggingIn(): boolean;
    callLoginMethod(options: CallLoginMethodOptions): void;
    _setLoggingIn(value: boolean): void;
    _storedLoginToken(): string | null;
  }

  export const Accounts: {
    _hashPassword(password: string): HashedPassword;
    emailTemplates: {
      from?: string;
      [key: string]: unknown;
    };
    urls: {
      resetPassword?(token: string): string;
      enrollAccount?(token: string): string;
      [key: string]: unknown;
    };
    createUserAsync(options: Record<string, unknown>): Promise<string>;
    findUserByUsername(
      username: string
    ): Promise<Record<string, unknown> | null>;
    findUserByEmail(email: string): Promise<Record<string, unknown> | null>;
    sendEnrollmentEmail(userId: string): Promise<void>;
    updateOrCreateUserFromExternalService(
      serviceName: string,
      serviceData: Record<string, unknown>,
      options: Record<string, unknown>
    ): string | undefined | Promise<string | undefined>;
  };
}

declare module 'meteor/mongo' {
  export namespace Mongo {
    interface CollectionOptions<TDocument> {
      connection?: unknown;
      idGeneration?: string;
      transform?(document: TDocument): unknown;
      [key: string]: unknown;
    }

    interface RawCollection<TDocument> {
      collectionName: string;
      aggregate<TResult = TDocument>(
        pipeline?: readonly unknown[],
        options?: unknown
      ): {
        toArray(): Promise<TResult[]>;
      };
      createIndex(keys: unknown, options?: unknown): Promise<string>;
      dropIndex(indexName: string): Promise<unknown>;
      // Atlas Search / Vector Search index management. Distinct from createIndex above: these are
      // served by mongot, and are only available on Atlas (or the atlas-local image). Listing goes
      // through aggregate([{ $listSearchIndexes: {} }]) rather than a dedicated method.
      createSearchIndex(description: {
        name: string;
        type?: string;
        definition: Record<string, unknown>;
      }): Promise<string>;
      distinct<TResult = unknown>(
        fieldName: string,
        query?: unknown
      ): Promise<TResult[]>;
    }

    interface Cursor<TDocument> {
      countAsync(): Promise<number>;
      fetch(): TDocument[];
      fetchAsync(): Promise<TDocument[]>;
      forEachAsync(
        callback: (document: TDocument) => void | Promise<void>
      ): Promise<void>;
    }

    class Collection<TDocument = Record<string, unknown>> {
      _name: string;
      constructor(
        name: string,
        options?: CollectionOptions<TDocument>
      );
      attachSchema(schema: unknown): void;
      find(selector?: unknown, options?: unknown): Cursor<TDocument>;
      findOneAsync(
        selector?: unknown,
        options?: unknown
      ): Promise<TDocument | undefined>;
      insertAsync(document: Partial<TDocument>): Promise<string>;
      updateAsync(
        selector: unknown,
        modifier: unknown,
        options?: unknown
      ): Promise<number>;
      removeAsync(selector: unknown): Promise<number>;
      rawCollection(): RawCollection<TDocument>;
      rawDatabase(): {
        dropCollection(
          name: string,
          callback?: (error?: Error | null) => void
        ): Promise<unknown> | void;
      };
    }
  }

  export const Assets: {
    getText(path: string): string;
    absoluteFilePath(path: string): string;
  };
}

declare module 'meteor/react-meteor-data' {
  export function useTracker<T>(
    reactiveFn: () => T,
    deps?: import('react').DependencyList
  ): T;
}

declare const Assets: {
  getText(path: string): string;
  absoluteFilePath(path: string): string;
};

declare const ServiceConfiguration: {
  configurations: {
    upsert(selector: unknown, modifier: unknown): void;
    upsertAsync(selector: unknown, modifier: unknown): Promise<void>;
  };
};

declare module 'meteor/idreesia-common/*';
declare module 'meteor/*';
