import { chatUrl } from '/imports/startup/chat';

// Rocket.Chat's Livechat visitor API. These endpoints need no login: the
// visitor token (chat-identity.ts) is the credential. Rocket.Chat rate-limits
// them per IP (about 10 calls a minute per endpoint, 5 for visitor and room),
// so callers poll gently and back off on 429.

export class ChatApiError extends Error {
  status: number;

  /** Rocket.Chat's error code, e.g. `room-closed`. */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ChatApiError';
    this.status = status;
    this.code = code;
  }
}

export type ChatApiDate = string | { $date: string | number };

export interface ChatApiAttachment {
  title?: string;
  title_link?: string;
  image_url?: string;
  audio_url?: string;
  video_url?: string;
}

export interface ChatApiMessage {
  _id: string;
  rid: string;
  msg?: string;
  ts: ChatApiDate;
  t?: string;
  alias?: string;
  token?: string;
  u?: { _id: string; username?: string; name?: string };
  attachments?: ChatApiAttachment[];
}

interface ChatApiVisitor {
  _id: string;
  token: string;
  lastChat?: { _id: string };
}

interface ChatApiRoom {
  _id: string;
  open?: boolean;
}

const ERROR_TEXT: Record<string, string> = {
  'room-closed': 'This conversation has been closed.',
  'no-agent-online': 'No one is available right now. Please try again later.',
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  if (!chatUrl) {
    throw new ChatApiError(0, 'Messaging is not configured for this app.');
  }

  let response: Response;
  try {
    response = await fetch(`${chatUrl}${path}`, init);
  } catch {
    throw new ChatApiError(0, 'Could not reach the server. Check your connection.');
  }

  let body: any = null;
  try {
    body = await response.json();
  } catch {
    // Non-JSON body; handled below.
  }

  if (!response.ok || body?.success === false) {
    if (response.status === 429) {
      throw new ChatApiError(429, 'Too many requests. Please wait a moment and try again.');
    }
    const code: string | undefined = body?.errorType ?? body?.error;
    const message =
      (code && ERROR_TEXT[code]) || body?.error || `Request failed (${response.status}).`;
    throw new ChatApiError(response.status, message, code);
  }
  return body as T;
};

const jsonInit = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

/** Creates or updates the visitor; `phone` is E.164. */
export const registerVisitor = (visitor: { token: string; name: string; phone: string }) =>
  request<{ visitor: ChatApiVisitor }>('/api/v1/livechat/visitor', jsonInit('POST', { visitor }));

/** The visitor, or null when Rocket.Chat doesn't know this token yet. */
export const getVisitor = async (token: string): Promise<ChatApiVisitor | null> => {
  try {
    const result = await request<{ visitor: ChatApiVisitor }>(
      `/api/v1/livechat/visitor/${encodeURIComponent(token)}`
    );
    return result.visitor ?? null;
  } catch (error) {
    if (error instanceof ChatApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
      return null;
    }
    throw error;
  }
};

/** The visitor's open room, created if there isn't one. */
export const getOrCreateRoom = async (token: string): Promise<ChatApiRoom> => {
  const result = await request<{ room: ChatApiRoom }>(
    `/api/v1/livechat/room?token=${encodeURIComponent(token)}`
  );
  return result.room;
};

export const sendTextMessage = (token: string, rid: string, msg: string) =>
  request<{ message: ChatApiMessage }>('/api/v1/livechat/message', jsonInit('POST', { token, rid, msg }));

export const uploadFile = (token: string, rid: string, file: Blob, fileName: string) => {
  const form = new FormData();
  form.append('file', file, fileName);
  return request<ChatApiMessage>(`/api/v1/livechat/upload/${encodeURIComponent(rid)}`, {
    method: 'POST',
    headers: { 'x-visitor-token': token },
    body: form,
  });
};

/** The room's messages, newest first. */
export const getRoomHistory = async (token: string, rid: string): Promise<ChatApiMessage[]> => {
  const result = await request<{ messages: ChatApiMessage[] }>(
    `/api/v1/livechat/messages.history/${encodeURIComponent(rid)}?token=${encodeURIComponent(
      token
    )}&limit=500`
  );
  return result.messages ?? [];
};

/**
 * Absolute URL for a file in a message (`/file-upload/...`). Rocket.Chat
 * protects uploads; the visitor's own room and token in the query string let
 * plain <img>/<audio> tags load it.
 */
export const visitorFileUrl = (path: string | undefined, rid: string, token: string) => {
  if (!path) return undefined;
  const base = /^https?:\/\//i.test(path) ? path : `${chatUrl}${path}`;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}rc_room_type=l&rc_rid=${encodeURIComponent(
    rid
  )}&rc_token=${encodeURIComponent(token)}`;
};
