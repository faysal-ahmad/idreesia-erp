import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { sendConversationMessage, getVideoConfig } = vi.hoisted(() => ({
  sendConversationMessage: vi.fn(),
  getVideoConfig: vi.fn(),
}));

vi.mock('meteor/idreesia-common/server/business-logic/rocket-chat', () => ({
  sendConversationMessage,
}));
vi.mock('meteor/idreesia-common/server/video/config', () => ({ getVideoConfig }));

import {
  buildRoomName,
  buildVideoCallUrl,
  getDiscussionVideoCallParticipantCount,
  getRoomParticipantCount,
  joinDiscussionVideoCall,
  VIDEO_CALL_ANNOUNCEMENT,
} from './video-call';

describe('buildRoomName', () => {
  it('is stable for the same secret and chat group', () => {
    expect(buildRoomName('s', 'group1')).toBe(buildRoomName('s', 'group1'));
  });

  it('differs per chat group and per secret', () => {
    expect(buildRoomName('s', 'group1')).not.toBe(buildRoomName('s', 'group2'));
    expect(buildRoomName('s1', 'group1')).not.toBe(buildRoomName('s2', 'group1'));
  });

  it('is URL-safe and does not contain the chat group id', () => {
    const room = buildRoomName('s', 'group1');
    expect(room).toMatch(/^[0-9a-f]{32}$/);
    expect(room).not.toContain('group1');
  });
});

describe('buildVideoCallUrl', () => {
  it('joins the base url, room and join settings', () => {
    const room = buildRoomName('s', 'g');
    expect(buildVideoCallUrl('http://localhost:8000', 's', 'g')).toBe(
      `http://localhost:8000/${room}#config.disableDeepLinking=true&config.prejoinConfig.enabled=false&config.startWithAudioMuted=true`
    );
  });

  it('ignores trailing slashes on the base url', () => {
    expect(buildVideoCallUrl('https://meet.example.com//', 's', 'g')).toMatch(
      /^https:\/\/meet\.example\.com\/[0-9a-f]{32}#/
    );
  });
});

const census = (rooms: Array<{ room_name: string; participants: number }>) =>
  vi.fn().mockResolvedValue({ ok: true, json: async () => ({ room_census: rooms }) });

describe('getRoomParticipantCount', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('reads the count of the matching room', async () => {
    vi.stubGlobal('fetch', census([
      { room_name: 'other@muc.meet.jitsi', participants: 5 },
      { room_name: 'abc@muc.meet.jitsi', participants: 2 },
    ]));
    expect(await getRoomParticipantCount('http://c', 'abc')).toBe(2);
  });

  it('is 0 when the room is not listed', async () => {
    vi.stubGlobal('fetch', census([]));
    expect(await getRoomParticipantCount('http://c', 'abc')).toBe(0);
  });

  it('is null when the census cannot be read', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await getRoomParticipantCount('http://c', 'abc')).toBeNull();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }));
    expect(await getRoomParticipantCount('http://c', 'abc')).toBeNull();
  });
});

describe('joinDiscussionVideoCall', () => {
  const actor = { _id: 'u1' };
  const room = buildRoomName('s', 'g');
  const config = { url: 'http://j', roomSecret: 's', censusUrl: 'http://c' };

  beforeEach(() => {
    sendConversationMessage.mockReset().mockResolvedValue(true);
    getVideoConfig.mockReset().mockReturnValue(config);
  });
  afterEach(() => vi.unstubAllGlobals());

  it('returns the link and announces when the room is empty', async () => {
    vi.stubGlobal('fetch', census([]));
    const result = await joinDiscussionVideoCall('g', actor);
    expect(result.url).toBe(buildVideoCallUrl('http://j', 's', 'g'));
    expect(sendConversationMessage).toHaveBeenCalledWith('g', actor, VIDEO_CALL_ANNOUNCEMENT);
  });

  it('does not announce when someone is already in the call', async () => {
    vi.stubGlobal('fetch', census([{ room_name: `${room}@muc.meet.jitsi`, participants: 1 }]));
    await joinDiscussionVideoCall('g', actor);
    expect(sendConversationMessage).not.toHaveBeenCalled();
  });

  it('does not announce when the census is unreadable or not configured', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    await joinDiscussionVideoCall('g', actor);
    getVideoConfig.mockReturnValue({ ...config, censusUrl: undefined });
    await joinDiscussionVideoCall('g', actor);
    expect(sendConversationMessage).not.toHaveBeenCalled();
  });

  it('still returns the link when the announcement fails', async () => {
    vi.stubGlobal('fetch', census([]));
    sendConversationMessage.mockRejectedValue(new Error('chat down'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await joinDiscussionVideoCall('g', actor);
    expect(result.url).toContain(room);
  });
});

describe('getDiscussionVideoCallParticipantCount', () => {
  const room = buildRoomName('s', 'g');

  beforeEach(() => {
    getVideoConfig.mockReset().mockReturnValue({ url: 'http://j', roomSecret: 's', censusUrl: 'http://c' });
  });
  afterEach(() => vi.unstubAllGlobals());

  it('counts the people in the discussion\'s room', async () => {
    vi.stubGlobal('fetch', census([{ room_name: `${room}@muc.meet.jitsi`, participants: 3 }]));
    expect(await getDiscussionVideoCallParticipantCount('g')).toBe(3);
  });

  it('is null when the census is not configured or unreadable', async () => {
    getVideoConfig.mockReturnValue({ url: 'http://j', roomSecret: 's' });
    expect(await getDiscussionVideoCallParticipantCount('g')).toBeNull();
    getVideoConfig.mockReturnValue({ url: 'http://j', roomSecret: 's', censusUrl: 'http://c' });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
    expect(await getDiscussionVideoCallParticipantCount('g')).toBeNull();
  });
});
