// The chat page's identity, kept on the device:
// - a random visitor token, created once per install. It is the Rocket.Chat
//   credential, so it is never derived from the phone number (anyone could
//   compute that). It survives "change number".
// - the customer's name and mobile number (E.164), sent as the visitor's
//   name and phone so reps see them in the ERP inbox.
// - the rooms this device has seen, because the visitor API can't list past
//   conversations.

const STORAGE_KEY = 'idreesia-chat';

interface StoredChat {
  token?: string;
  name?: string;
  mobileNumber?: string;
  roomIds?: string[];
}

export interface ChatIdentity {
  token: string;
  name: string;
  mobileNumber: string;
}

// Used when localStorage is unavailable, so the page still works this session.
let memoryStore: StoredChat = {};

const read = (): StoredChat => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredChat) : memoryStore;
  } catch {
    return memoryStore;
  }
};

const write = (value: StoredChat) => {
  memoryStore = value;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Keep the in-memory copy.
  }
};

const randomToken = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const getOrCreateToken = (): string => {
  const stored = read();
  if (stored.token) return stored.token;
  const token = randomToken();
  write({ ...stored, token });
  return token;
};

export const loadIdentity = (): ChatIdentity | null => {
  const stored = read();
  if (!stored.token || !stored.name || !stored.mobileNumber) return null;
  return { token: stored.token, name: stored.name, mobileNumber: stored.mobileNumber };
};

export const saveIdentity = (name: string, mobileNumber: string): ChatIdentity => {
  const token = getOrCreateToken();
  write({ ...read(), name, mobileNumber });
  return { token, name, mobileNumber };
};

/** Forgets the name and number; the token and conversation history stay. */
export const clearIdentity = () => {
  const { token, roomIds } = read();
  write({ token, roomIds });
};

export const loadRoomIds = (): string[] => read().roomIds ?? [];

export const addRoomId = (roomId: string) => {
  const stored = read();
  const roomIds = stored.roomIds ?? [];
  if (!roomIds.includes(roomId)) write({ ...stored, roomIds: [...roomIds, roomId] });
};

/**
 * Normalises a typed mobile number to E.164. Pakistani numbers may be typed
 * as 03XXXXXXXXX, 3XXXXXXXXX, 923XXXXXXXXX, 00923… or +923…; other countries
 * need a leading + (or 00) and 8-15 digits. Returns null if it isn't valid.
 */
export const toE164 = (input: string): string | null => {
  const trimmed = input.trim();
  let digits = trimmed.replace(/\D/g, '');
  let international = trimmed.startsWith('+');
  if (!international && digits.startsWith('00')) {
    digits = digits.slice(2);
    international = true;
  }

  if (international) {
    if (digits.startsWith('92')) {
      return /^923\d{9}$/.test(digits) ? `+${digits}` : null;
    }
    return /^[1-9]\d{7,14}$/.test(digits) ? `+${digits}` : null;
  }

  if (/^03\d{9}$/.test(digits)) return `+92${digits.slice(1)}`;
  if (/^3\d{9}$/.test(digits)) return `+92${digits}`;
  if (/^923\d{9}$/.test(digits)) return `+${digits}`;
  return null;
};
