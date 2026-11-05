import {
  ChatError,
  chatFetchRaw,
  chatGet,
  chatPost,
} from './client';

// ----------------------------------------------------------------------------
// Rocket.Chat shapes (only the fields the ERP uses)
// ----------------------------------------------------------------------------

export type ChatDate = string | { $date: string | number } | Date;

export interface ChatAttachment {
  type?: string;
  title?: string;
  title_link?: string;
  description?: string;
  image_url?: string;
  image_type?: string;
  image_size?: number;
  audio_url?: string;
  audio_type?: string;
  audio_size?: number;
  video_url?: string;
  video_type?: string;
  video_size?: number;
}

export interface ChatMessage {
  _id: string;
  rid: string;
  msg?: string;
  ts: ChatDate;
  t?: string;
  alias?: string;
  token?: string;
  u?: { _id: string; username?: string; name?: string };
  file?: { _id: string; name?: string; type?: string };
  attachments?: ChatAttachment[];
}

export interface ChatVisitorInfo {
  _id: string;
  token?: string;
  username?: string;
  name?: string;
  phone?: Array<{ phoneNumber?: string }> | string | null;
}

export interface ChatLivechatRoom {
  _id: string;
  t?: string;
  fname?: string;
  ts: ChatDate;
  lm?: ChatDate;
  open?: boolean;
  closedAt?: ChatDate;
  waitingResponse?: boolean;
  v: ChatVisitorInfo;
  servedBy?: { _id: string; username?: string };
  lastMessage?: ChatMessage;
}

const PAGE_SIZE = 100;

// ----------------------------------------------------------------------------
// Rooms
// ----------------------------------------------------------------------------

// Upper bound on open rooms fetched per state. Open conversations are few;
// this only guards against a runaway list.
const MAX_OPEN_ROOMS_PER_STATE = 1000;

const fetchRooms = async (query: Record<string, string | undefined>) => {
  const rooms: ChatLivechatRoom[] = [];
  let offset = 0;
  let total = 0;
  do {
    const result = await chatGet<{
      rooms: ChatLivechatRoom[];
      total: number;
    }>('/api/v1/livechat/rooms', {
      ...query,
      sort: JSON.stringify({ lm: -1 }),
      offset,
      count: PAGE_SIZE,
    });
    const page = result.rooms ?? [];
    rooms.push(...page);
    total = result.total ?? 0;
    offset += PAGE_SIZE;
    if (page.length === 0) break;
  } while (offset < total && offset < MAX_OPEN_ROOMS_PER_STATE);
  return rooms;
};

const activityTime = (room: ChatLivechatRoom) => {
  const value = room.lm ?? room.ts;
  const raw = typeof value === 'object' && value && '$date' in value
    ? value.$date
    : (value as string | Date);
  return new Date(raw).getTime() || 0;
};

/**
 * Open rooms, newest activity first. In Rocket.Chat 8.x `open=true` only
 * matches rooms already served by an agent; rooms still waiting in the queue
 * need `queued=true`. The ERP replies through a service account that never
 * takes chats, so most rooms stay queued - both sets are fetched and merged.
 * Filtering and paging happen in the caller (Rocket.Chat can't search by
 * phone number).
 */
export const listOpenRooms = async () => {
  const [served, queued] = await Promise.all([
    fetchRooms({ open: 'true' }),
    fetchRooms({ open: 'true', queued: 'true' }),
  ]);

  const byId = new Map<string, ChatLivechatRoom>();
  [...served, ...queued].forEach(room => {
    if (room.open !== false) byId.set(room._id, room);
  });
  const rooms = Array.from(byId.values()).sort(
    (a, b) => activityTime(b) - activityTime(a)
  );

  return rooms;
};

// ----------------------------------------------------------------------------
// Visitors
// ----------------------------------------------------------------------------

// Rooms only carry the visitor's id, token and username - not the phone. The
// mobile app's token is random, so the phone (E.164) has to come from the
// visitor record. It rarely changes, so it is cached briefly.
const VISITOR_PHONE_TTL_MS = 5 * 60 * 1000;
const visitorPhones = new Map<string, { phone: string | null; at: number }>();

const toPhoneString = (phone: ChatVisitorInfo['phone']) => {
  if (!phone) return null;
  if (typeof phone === 'string') return phone;
  return phone[0]?.phoneNumber ?? null;
};

export const getVisitorPhone = async (visitorId: string) => {
  const cached = visitorPhones.get(visitorId);
  if (cached && Date.now() - cached.at < VISITOR_PHONE_TTL_MS) {
    return cached.phone;
  }
  const result = await chatGet<{ visitor: ChatVisitorInfo }>(
    '/api/v1/livechat/visitors.info',
    { visitorId }
  );
  const phone = toPhoneString(result.visitor?.phone);
  visitorPhones.set(visitorId, { phone, at: Date.now() });
  return phone;
};

/** Copies of the rooms with `v.phone` filled in (room visitor info lacks it). */
export const withVisitorPhones = async (
  rooms: ChatLivechatRoom[]
): Promise<ChatLivechatRoom[]> =>
  Promise.all(
    rooms.map(async room => {
      if (!room.v?._id || room.v.phone) return room;
      try {
        const phone = await getVisitorPhone(room.v._id);
        return { ...room, v: { ...room.v, phone } };
      } catch {
        // Leave it empty; the inbox falls back to the token.
        return room;
      }
    })
  );

export const getRoom = async (roomId: string) => {
  const result = await chatGet<{ room: ChatLivechatRoom }>(
    '/api/v1/rooms.info',
    { roomId }
  );
  return result.room;
};

/**
 * Every room (open and closed) the visitor has had. `roomId` must be a room
 * the service account can access - Rocket.Chat only uses it for that check.
 */
export const getVisitorRooms = async (roomId: string, visitorId: string) => {
  const rooms: ChatLivechatRoom[] = [];
  let offset = 0;
  let total = 0;
  do {
    const result = await chatGet<{
      history: ChatLivechatRoom[];
      total: number;
    }>(
      `/api/v1/livechat/visitors.chatHistory/room/${encodeURIComponent(
        roomId
      )}/visitor/${encodeURIComponent(visitorId)}`,
      { offset, count: PAGE_SIZE }
    );
    const page = result.history ?? [];
    rooms.push(...page);
    total = result.total ?? 0;
    offset += PAGE_SIZE;
    if (page.length === 0) break;
  } while (offset < total);
  return rooms;
};

// ----------------------------------------------------------------------------
// Messages
// ----------------------------------------------------------------------------

const fetchRoomMessages = async (roomId: string) => {
  const messages: ChatMessage[] = [];
  let offset = 0;
  let total = 0;
  do {
    const result = await chatGet<{
      messages: ChatMessage[];
      total: number;
    }>(`/api/v1/livechat/${encodeURIComponent(roomId)}/messages`, {
      sort: JSON.stringify({ ts: 1 }),
      offset,
      count: PAGE_SIZE,
    });
    const page = result.messages ?? [];
    messages.push(...page);
    total = result.total ?? 0;
    offset += PAGE_SIZE;
    if (page.length === 0) break;
  } while (offset < total);
  return messages;
};

// Closed rooms never change, so their messages are kept in memory and only
// the open room is re-fetched while the inbox polls.
const CLOSED_ROOM_CACHE_LIMIT = 500;
const closedRoomMessages = new Map<string, ChatMessage[]>();

export const getRoomMessages = async (roomId: string, isClosed: boolean) => {
  if (isClosed) {
    const cached = closedRoomMessages.get(roomId);
    if (cached) return cached;
  }

  const messages = await fetchRoomMessages(roomId);

  if (isClosed) {
    if (closedRoomMessages.size >= CLOSED_ROOM_CACHE_LIMIT) {
      const oldestKey = closedRoomMessages.keys().next().value;
      if (oldestKey) closedRoomMessages.delete(oldestKey);
    }
    closedRoomMessages.set(roomId, messages);
  }
  return messages;
};

/**
 * Posts a reply into the room as the service account. `alias` shows the ERP
 * representative's name instead of the service account's (needs the
 * "Impersonate Other Users" (`message-impersonate`) permission in Rocket.Chat).
 */
export const sendAgentMessage = async (
  roomId: string,
  text: string,
  alias?: string
) => {
  const result = await chatPost<{ message: ChatMessage }>(
    '/api/v1/chat.sendMessage',
    { message: { rid: roomId, msg: text, ...(alias ? { alias } : {}) } }
  );
  return result.message;
};

// ----------------------------------------------------------------------------
// Files
// ----------------------------------------------------------------------------

// Visitor tokens by room id; a room's visitor never changes.
const roomVisitorTokens = new Map<string, string>();

/**
 * A file uploaded to a Livechat room. Rocket.Chat only lets room *members*
 * download files (FileUpload_Restrict_to_room_members), and the service
 * account never joins Livechat rooms, so it gets 403. The room's visitor is a
 * member, so the file is fetched with the visitor's room credentials
 * (looked up with the service account) instead.
 */
export const fetchUploadedFile = async (
  roomId: string,
  fileId: string,
  fileName: string
) => {
  let token = roomVisitorTokens.get(roomId);
  if (!token) {
    const room = await getRoom(roomId);
    if (!room || room.t !== 'l' || !room.v?.token) {
      throw new ChatError(404, 'Conversation not found.');
    }
    token = room.v.token;
    roomVisitorTokens.set(roomId, token);
  }

  const query = new URLSearchParams({
    rc_room_type: 'l',
    rc_rid: roomId,
    rc_token: token,
  });
  return chatFetchRaw(
    `/file-upload/${encodeURIComponent(fileId)}/${encodeURIComponent(
      fileName
    )}?${query.toString()}`,
    { authenticated: false }
  );
};
