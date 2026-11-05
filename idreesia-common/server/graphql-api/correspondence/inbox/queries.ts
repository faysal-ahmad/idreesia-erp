import {
  getRoom,
  getRoomMessages,
  getVisitorRooms,
  listOpenRooms,
  withVisitorPhones,
  sendAgentMessage,
  type ChatAttachment,
  type ChatDate,
  type ChatLivechatRoom,
  type ChatMessage,
} from 'meteor/idreesia-common/server/chat';

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const MAX_REPLY_LENGTH = 5000;

// ----------------------------------------------------------------------------
// Mapping Rocket.Chat → ERP GraphQL shapes
// ----------------------------------------------------------------------------

const toIsoString = (date?: ChatDate | null): string | null => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'object' && '$date' in date) {
    return new Date(date.$date).toISOString();
  }
  return new Date(date).toISOString();
};

// Rocket.Chat serves uploads at /file-upload/<fileId>/<fileName>. The browser
// can't reach Rocket.Chat, so they are rewritten to the ERP media proxy, which
// needs the room id to fetch them with that room's visitor credentials.
const FILE_UPLOAD_PATH = /^\/file-upload\/([^/?#]+)\/([^?#]+)/;

const toProxyUrl = (
  rcUrl: string | null | undefined,
  roomId: string
): string | null => {
  if (!rcUrl || !roomId) return null;
  let path = rcUrl;
  if (/^https?:\/\//i.test(rcUrl)) {
    try {
      path = new URL(rcUrl).pathname;
    } catch {
      return null;
    }
  }
  const match = FILE_UPLOAD_PATH.exec(path);
  if (!match) return null;
  return `/api/correspondence/files/${roomId}/${match[1]}/${match[2]}`;
};

const mapAttachment = (attachment: ChatAttachment, roomId: string) => {
  if (attachment.image_url) {
    return {
      kind: 'image',
      title: attachment.title ?? null,
      mimeType: attachment.image_type ?? null,
      size: attachment.image_size ?? null,
      url: toProxyUrl(attachment.image_url, roomId),
    };
  }
  if (attachment.audio_url) {
    return {
      kind: 'audio',
      title: attachment.title ?? null,
      mimeType: attachment.audio_type ?? null,
      size: attachment.audio_size ?? null,
      url: toProxyUrl(attachment.audio_url, roomId),
    };
  }
  if (attachment.video_url) {
    return {
      kind: 'video',
      title: attachment.title ?? null,
      mimeType: attachment.video_type ?? null,
      size: attachment.video_size ?? null,
      url: toProxyUrl(attachment.video_url, roomId),
    };
  }
  if (attachment.title_link) {
    return {
      kind: 'file',
      title: attachment.title ?? null,
      mimeType: null,
      size: null,
      url: toProxyUrl(attachment.title_link, roomId),
    };
  }
  // Quotes and other attachment types without a file are not shown.
  return null;
};

const mapMessage = (message?: ChatMessage | null) => {
  if (!message) return null;

  let senderType = 'agent';
  if (message.t === 'livechat-close') senderType = 'system';
  else if (message.token) senderType = 'visitor';

  return {
    _id: message._id,
    roomId: message.rid,
    text: message.msg ?? '',
    sentAt: toIsoString(message.ts),
    senderType,
    senderName:
      message.alias || message.u?.name || message.u?.username || null,
    attachments: (message.attachments ?? [])
      .map(attachment => mapAttachment(attachment, message.rid))
      .filter(Boolean),
  };
};

// The visitor's phone (E.164, sent by the mobile app). Older visitors used
// the mobile number itself as the token, so that is the fallback.
const getMobileNumber = (room: ChatLivechatRoom) => {
  const { phone } = room.v ?? {};
  if (typeof phone === 'string' && phone) return phone;
  if (Array.isArray(phone) && phone[0]?.phoneNumber) return phone[0].phoneNumber;
  return room.v?.token ?? null;
};

const mapConversation = (room: ChatLivechatRoom) => ({
  _id: room._id,
  visitorId: room.v?._id ?? null,
  customerName: room.fname || room.v?.name || room.v?.username || null,
  mobileNumber: getMobileNumber(room),
  startedAt: toIsoString(room.ts),
  lastMessageAt: toIsoString(room.lm ?? room.ts),
  lastMessage: mapMessage(room.lastMessage),
  waitingResponse: room.waitingResponse ?? false,
  assignedTo: room.servedBy?.username ?? null,
  open: room.open ?? false,
});

// ----------------------------------------------------------------------------
// Queries / mutations
// ----------------------------------------------------------------------------

interface InboxConversationFilter {
  searchText?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

export const getInboxConversations = async (
  filter: InboxConversationFilter
) => {
  const pageIndex = Math.max(parseInt(filter.pageIndex ?? '0', 10) || 0, 0);
  const pageSize = Math.min(
    Math.max(parseInt(filter.pageSize ?? '', 10) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE
  );

  // A visitor has at most one open room, so each open room is one customer.
  // Rocket.Chat can only search room names, so the phone-number search is
  // done here, on digits only ("0300-123 4567" matches "03001234567").
  const searchDigits = (filter.searchText ?? '').replace(/\D/g, '');
  const rooms = (await withVisitorPhones(await listOpenRooms())).filter(
    room =>
      !searchDigits ||
      (getMobileNumber(room) ?? '').replace(/\D/g, '').includes(searchDigits)
  );

  const offset = pageIndex * pageSize;
  return {
    totalResults: rooms.length,
    data: rooms.slice(offset, offset + pageSize).map(mapConversation),
  };
};

export const getInboxConversation = async (roomId: string) => {
  const fetchedRoom = await getRoom(roomId);
  if (!fetchedRoom || fetchedRoom.t !== 'l') return null;
  const [room] = await withVisitorPhones([fetchedRoom]);

  const visitorRooms = room.v?._id
    ? await getVisitorRooms(roomId, room.v._id)
    : [room];
  if (!visitorRooms.some(visitorRoom => visitorRoom._id === room._id)) {
    visitorRooms.push(room);
  }

  const roomMessages = await Promise.all(
    visitorRooms.map(visitorRoom =>
      getRoomMessages(
        visitorRoom._id,
        visitorRoom._id !== room._id && !!visitorRoom.closedAt
      )
    )
  );

  const messages = roomMessages
    .flat()
    .map(mapMessage)
    .filter(Boolean)
    .sort((a, b) => (a!.sentAt ?? '').localeCompare(b!.sentAt ?? ''));

  return {
    conversation: mapConversation(room),
    messages,
  };
};

export const replyToInboxConversation = async (
  roomId: string,
  text: string,
  senderName?: string | null
) => {
  const trimmed = (text ?? '').trim();
  if (!trimmed) throw new Error('Message text is required.');
  if (trimmed.length > MAX_REPLY_LENGTH) {
    throw new Error(
      `Message is too long (max ${MAX_REPLY_LENGTH} characters).`
    );
  }

  const room = await getRoom(roomId);
  if (!room || room.t !== 'l') throw new Error('Conversation not found.');
  if (!room.open) throw new Error('This conversation has been closed.');

  const message = await sendAgentMessage(
    roomId,
    trimmed,
    senderName ?? undefined
  );
  return mapMessage(message);
};
