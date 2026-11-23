import { backendUrl } from '/imports/startup/backend';

import { cordovaPlatform } from '../utilities/capture-photo';

// The credential of the device's trusted-device (PIN) login: the device id
// and the secret the server issued when the user turned quick login on, plus
// who it belongs to, to greet them on the PIN screen. The PIN is never kept.
//
// In the iOS and Android apps it lives in the Keychain / Keystore through
// cordova-plugin-secure-storage-echo. Without the plugin (the browser, or a
// phone the plugin can't use, such as an Android one with no screen lock)
// it falls back to localStorage. The secret alone can't log in, because
// the server also needs the PIN and revokes the device after a few wrong ones.

export interface StoredDevice {
  deviceId: string;
  secret: string;
  /** What to call the user on the PIN screen. */
  label: string;
}

interface SecureStorageInstance {
  get(
    success: (value: string) => void,
    error: (error: unknown) => void,
    key: string
  ): void;
  set(
    success: (key: string) => void,
    error: (error: unknown) => void,
    key: string,
    value: string
  ): void;
  remove(
    success: (key: string) => void,
    error: (error: unknown) => void,
    key: string
  ): void;
}

interface CordovaSecureStorage {
  new (
    success: () => void,
    error: (error: unknown) => void,
    service: string
  ): SecureStorageInstance;
}

const KEY = `trusted-device:${backendUrl}`;

const secureStorageClass = (): CordovaSecureStorage | undefined => {
  if (!cordovaPlatform()) return undefined;
  return (
    window as unknown as {
      cordova?: { plugins?: { SecureStorage?: CordovaSecureStorage } };
    }
  ).cordova?.plugins?.SecureStorage;
};

let secureStorage: Promise<SecureStorageInstance | null> | null = null;

/** The plugin's storage, or null where it isn't there or can't be opened. */
const openSecureStorage = () => {
  if (!secureStorage) {
    secureStorage = new Promise(resolve => {
      const SecureStorage = secureStorageClass();
      if (!SecureStorage) {
        resolve(null);
        return;
      }
      try {
        const instance = new SecureStorage(
          () => resolve(instance),
          () => resolve(null),
          'idreesia'
        );
      } catch {
        resolve(null);
      }
    });
  }
  return secureStorage;
};

const readLocal = (): string | null => {
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

const writeLocal = (value: string | null) => {
  try {
    if (value === null) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, value);
  } catch {
    // Storage is unavailable: the device just isn't remembered.
  }
};

const parse = (raw: string | null): StoredDevice | null => {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredDevice>;
    return value.deviceId && value.secret
      ? { deviceId: value.deviceId, secret: value.secret, label: value.label ?? '' }
      : null;
  } catch {
    return null;
  }
};

export const loadStoredDevice = async (): Promise<StoredDevice | null> => {
  const storage = await openSecureStorage();
  if (storage) {
    const raw = await new Promise<string | null>(resolve => {
      storage.get(
        value => resolve(value),
        () => resolve(null),
        KEY
      );
    });
    if (raw) return parse(raw);
  }
  return parse(readLocal());
};

export const saveStoredDevice = async (device: StoredDevice): Promise<void> => {
  const raw = JSON.stringify(device);
  const storage = await openSecureStorage();
  if (storage) {
    const saved = await new Promise<boolean>(resolve => {
      storage.set(
        () => resolve(true),
        () => resolve(false),
        KEY,
        raw
      );
    });
    if (saved) {
      writeLocal(null);
      return;
    }
  }
  writeLocal(raw);
};

export const clearStoredDevice = async (): Promise<void> => {
  const storage = await openSecureStorage();
  if (storage) {
    await new Promise<void>(resolve => {
      storage.remove(
        () => resolve(),
        () => resolve(),
        KEY
      );
    });
  }
  writeLocal(null);
};
