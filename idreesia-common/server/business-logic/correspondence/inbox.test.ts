import { beforeEach, describe, expect, it, vi } from 'vitest';

const chat = vi.hoisted(() => ({
  getRoom: vi.fn(),
  getRoomMessages: vi.fn(),
  getVisitorRooms: vi.fn(),
  listOpenRooms: vi.fn(),
  withVisitorPhones: vi.fn(async (rooms: unknown[]) => rooms),
  sendAgentMessage: vi.fn(),
}));

vi.mock('meteor/idreesia-common/server/chat', async () => {
  const mapping = await import('meteor/idreesia-common/server/chat/message-mapping');
  return { ...chat, ...mapping };
});

const {
  getInboxConversation,
  getInboxConversations,
  replyToInboxConversation,
} = await import('./inbox');

const room = (id: string, extra: Record<string, unknown> = {}) => ({
  _id: id,
  t: 'l',
  ts: '2024-01-01T00:00:00.000Z',
  open: true,
  v: { _id: `v-${id}`, token: `tok-${id}` },
  ...extra,
});

beforeEach(() => {
  vi.resetAllMocks();
  chat.withVisitorPhones.mockImplementation(async rooms => rooms);
});

describe('getInboxConversations', () => {
  it('maps rooms to conversations', async () => {
    chat.listOpenRooms.mockResolvedValue([
      room('r1', {
        fname: 'Ali',
        v: { _id: 'v1', phone: [{ phoneNumber: '+923001234567' }] },
        lm: '2024-01-02T00:00:00.000Z',
        servedBy: { username: 'agent' },
        waitingResponse: true,
        lastMessage: { _id: 'm1', rid: 'r1', msg: 'hi', ts: '2024-01-02T00:00:00.000Z', token: 'x' },
      }),
    ]);
    const { data, totalResults } = await getInboxConversations({});
    expect(totalResults).toBe(1);
    expect(data[0]).toMatchObject({
      _id: 'r1',
      visitorId: 'v1',
      customerName: 'Ali',
      mobileNumber: '+923001234567',
      startedAt: '2024-01-01T00:00:00.000Z',
      lastMessageAt: '2024-01-02T00:00:00.000Z',
      waitingResponse: true,
      assignedTo: 'agent',
      open: true,
    });
    expect(data[0].lastMessage).toMatchObject({ text: 'hi', senderType: 'visitor' });
  });

  it('falls back to the visitor token when there is no phone, and to ts for lastMessageAt', async () => {
    chat.listOpenRooms.mockResolvedValue([room('r1', { v: { _id: 'v1', token: '0300111' } })]);
    const { data } = await getInboxConversations({});
    expect(data[0].mobileNumber).toBe('0300111');
    expect(data[0].lastMessageAt).toBe(data[0].startedAt);
    expect(data[0].customerName).toBeNull();
    expect(data[0].assignedTo).toBeNull();
  });

  it('accepts a plain string phone', async () => {
    chat.listOpenRooms.mockResolvedValue([room('r1', { v: { _id: 'v', phone: '+92300' } })]);
    expect((await getInboxConversations({})).data[0].mobileNumber).toBe('+92300');
  });

  it('searches the phone number on digits only', async () => {
    chat.listOpenRooms.mockResolvedValue([
      room('r1', { v: { _id: 'a', phone: '+92 300-1234567' } }),
      room('r2', { v: { _id: 'b', phone: '+92 321 9999999' } }),
      room('r3', { v: { _id: 'c', token: '03001234567' } }),
    ]);
    const result = await getInboxConversations({ searchText: '300 1234' });
    expect(result.data.map(c => c._id)).toEqual(['r1', 'r3']);
    expect(result.totalResults).toBe(2);

    const local = await getInboxConversations({ searchText: '0300-123 4567' });
    expect(local.data.map(c => c._id)).toEqual(['r3']);
  });

  it('ignores a search with no digits', async () => {
    chat.listOpenRooms.mockResolvedValue([room('r1'), room('r2')]);
    expect((await getInboxConversations({ searchText: 'abc' })).totalResults).toBe(2);
  });

  it('pages, clamping page index and size', async () => {
    chat.listOpenRooms.mockResolvedValue(
      Array.from({ length: 5 }, (_, i) => room(`r${i}`))
    );
    const page = await getInboxConversations({ pageIndex: '1', pageSize: '2' });
    expect(page.data.map(c => c._id)).toEqual(['r2', 'r3']);
    expect(page.totalResults).toBe(5);

    const negative = await getInboxConversations({ pageIndex: '-3', pageSize: '2' });
    expect(negative.data.map(c => c._id)).toEqual(['r0', 'r1']);

    const huge = await getInboxConversations({ pageSize: '100000' });
    expect(huge.data).toHaveLength(5);

    const junk = await getInboxConversations({ pageIndex: 'x', pageSize: 'y' });
    expect(junk.data).toHaveLength(5);
  });

  it('clamps the page size to 100', async () => {
    chat.listOpenRooms.mockResolvedValue(
      Array.from({ length: 150 }, (_, i) => room(`r${i}`))
    );
    const { data } = await getInboxConversations({ pageSize: '500' });
    expect(data).toHaveLength(100);
  });
});

describe('getInboxConversation', () => {
  it('returns null for a missing or non-livechat room', async () => {
    chat.getRoom.mockResolvedValueOnce(null);
    expect(await getInboxConversation('x')).toBeNull();
    chat.getRoom.mockResolvedValueOnce(room('r1', { t: 'p' }));
    expect(await getInboxConversation('r1')).toBeNull();
  });

  it('merges the messages of all the visitor rooms in time order', async () => {
    const current = room('r2');
    chat.getRoom.mockResolvedValue(current);
    chat.getVisitorRooms.mockResolvedValue([
      room('r1', { closedAt: '2023-12-31T00:00:00.000Z' }),
    ]);
    chat.getRoomMessages.mockImplementation(async (rid: string) =>
      rid === 'r1'
        ? [{ _id: 'm1', rid: 'r1', msg: 'old', ts: '2024-01-01T10:00:00.000Z', token: 't' }]
        : [
            { _id: 'm3', rid: 'r2', msg: 'closing', ts: '2024-01-03T00:00:00.000Z', t: 'livechat-close' },
            { _id: 'm2', rid: 'r2', msg: 'new', ts: '2024-01-02T00:00:00.000Z', u: { _id: 'u', username: 'agent' } },
          ]
    );

    const result = await getInboxConversation('r2');
    expect(result!.messages.map(m => m!._id)).toEqual(['m1', 'm2', 'm3']);
    expect(result!.messages.map(m => m!.senderType)).toEqual(['visitor', 'agent', 'system']);
    expect(result!.messages[1]!.senderName).toBe('agent');
    // The closed earlier room is read as closed; the current one is not.
    expect(chat.getRoomMessages).toHaveBeenCalledWith('r1', true);
    expect(chat.getRoomMessages).toHaveBeenCalledWith('r2', false);
  });

  it('includes the current room even if the visitor room list omits it', async () => {
    chat.getRoom.mockResolvedValue(room('r2'));
    chat.getVisitorRooms.mockResolvedValue([]);
    chat.getRoomMessages.mockResolvedValue([]);
    await getInboxConversation('r2');
    expect(chat.getRoomMessages).toHaveBeenCalledTimes(1);
    expect(chat.getRoomMessages).toHaveBeenCalledWith('r2', false);
  });

  it('uses only the room itself when it has no visitor', async () => {
    chat.getRoom.mockResolvedValue(room('r2', { v: undefined }));
    chat.getRoomMessages.mockResolvedValue([]);
    await getInboxConversation('r2');
    expect(chat.getVisitorRooms).not.toHaveBeenCalled();
  });

  it('rewrites upload urls to the ERP media proxy', async () => {
    chat.getRoom.mockResolvedValue(room('r1'));
    chat.getVisitorRooms.mockResolvedValue([room('r1')]);
    chat.getRoomMessages.mockResolvedValue([
      {
        _id: 'm1',
        rid: 'r1',
        ts: '2024-01-01T00:00:00.000Z',
        attachments: [
          { image_url: '/file-upload/abc/pic.png', title: 'pic' },
          { title: 'a quote' },
        ],
      },
    ]);
    const { messages } = (await getInboxConversation('r1'))!;
    expect(messages[0]!.attachments).toHaveLength(1);
    expect(messages[0]!.attachments[0]).toMatchObject({
      kind: 'image',
      url: '/api/correspondence/files/r1/abc/pic.png',
    });
  });
});

describe('replyToInboxConversation', () => {
  it('rejects empty and over-long text', async () => {
    await expect(replyToInboxConversation('r1', '   ')).rejects.toThrow(
      'Message text is required.'
    );
    await expect(
      replyToInboxConversation('r1', 'x'.repeat(5001))
    ).rejects.toThrow('too long');
    expect(chat.getRoom).not.toHaveBeenCalled();
  });

  it('accepts text of exactly the maximum length', async () => {
    chat.getRoom.mockResolvedValue(room('r1'));
    chat.sendAgentMessage.mockResolvedValue({ _id: 'm', rid: 'r1', ts: new Date() });
    await replyToInboxConversation('r1', 'x'.repeat(5000));
    expect(chat.sendAgentMessage).toHaveBeenCalled();
  });

  it('rejects an unknown, non-livechat or closed conversation', async () => {
    chat.getRoom.mockResolvedValueOnce(null);
    await expect(replyToInboxConversation('r1', 'hi')).rejects.toThrow('Conversation not found.');
    chat.getRoom.mockResolvedValueOnce(room('r1', { t: 'c' }));
    await expect(replyToInboxConversation('r1', 'hi')).rejects.toThrow('Conversation not found.');
    chat.getRoom.mockResolvedValueOnce(room('r1', { open: false }));
    await expect(replyToInboxConversation('r1', 'hi')).rejects.toThrow('closed');
    expect(chat.sendAgentMessage).not.toHaveBeenCalled();
  });

  it('sends the trimmed text under the sender name', async () => {
    chat.getRoom.mockResolvedValue(room('r1'));
    chat.sendAgentMessage.mockResolvedValue({
      _id: 'm1',
      rid: 'r1',
      msg: 'hello',
      ts: '2024-01-01T00:00:00.000Z',
      alias: 'Support',
    });
    const message = await replyToInboxConversation('r1', '  hello  ', 'Support');
    expect(chat.sendAgentMessage).toHaveBeenCalledWith('r1', 'hello', 'Support');
    expect(message).toMatchObject({ _id: 'm1', text: 'hello', senderName: 'Support', senderType: 'agent' });

    await replyToInboxConversation('r1', 'again', null);
    expect(chat.sendAgentMessage).toHaveBeenLastCalledWith('r1', 'again', undefined);
  });
});
