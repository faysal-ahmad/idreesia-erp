import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getVideoConfig } = vi.hoisted(() => ({ getVideoConfig: vi.fn() }));
vi.mock('meteor/idreesia-common/server/video/config', () => ({ getVideoConfig }));

import {
  buildRoomName,
  buildVideoCallUrl,
} from 'meteor/idreesia-common/server/video/room';

import {
  cancelMeeting,
  createMeeting,
  createMeetingsWorkspace,
  getMeeting,
  getMeetingVideoCallParticipantCount,
  getMeetingVideoCallUrl,
  updateMeeting,
} from './index';
import { meetingRoomKey } from './video-call';

const HOUR = 60 * 60 * 1000;
const startsAt = new Date(Date.now() + 24 * HOUR);
const endsAt = new Date(startsAt.getTime() + HOUR);

let workspaceId: string;

beforeEach(async () => {
  vi.restoreAllMocks();
  getVideoConfig.mockReturnValue({ url: 'https://meet.example.org/', roomSecret: 'secret' });
  workspaceId = (await createMeetingsWorkspace({ name: 'W' }, 'u1'))._id;
});

const schedule = (extra: Record<string, unknown> = {}) =>
  createMeeting({ workspaceId, title: 'Board', startsAt, endsAt, ...extra }, 'u1');

describe('video-call meetings', () => {
  it('stores the video call flag, and can clear it', async () => {
    const meeting = await schedule({ videoCall: true });
    expect(meeting.videoCall).toBe(true);
    expect((await schedule()).videoCall).toBeUndefined();

    await updateMeeting(meeting._id, { videoCall: false }, 'u1');
    expect((await getMeeting(meeting._id, 'u1')).videoCall).toBeUndefined();
  });

  it('gives each meeting its own stable room, namespaced away from other keys', async () => {
    const a = await schedule({ videoCall: true });
    const b = await schedule({ videoCall: true });

    const first = await getMeetingVideoCallUrl(a._id, 'u2');
    expect((await getMeetingVideoCallUrl(a._id, 'u3')).url).toBe(first.url);
    expect((await getMeetingVideoCallUrl(b._id, 'u2')).url).not.toBe(first.url);
    expect(first.url).toBe(buildVideoCallUrl('https://meet.example.org', 'secret', `meeting:${a._id}`));
    // The room is not the raw id, which a discussion's room could equal.
    expect(first.url).not.toContain(buildRoomName('secret', a._id));
    expect(meetingRoomKey(a._id)).toBe(`meeting:${a._id}`);
  });

  it('refuses meetings that are not video calls, and cancelled ones', async () => {
    const inPerson = await schedule({ location: 'Hall' });
    await expect(getMeetingVideoCallUrl(inPerson._id, 'u1')).rejects.toMatchObject({
      extensions: { code: 'BAD_USER_INPUT' },
    });

    const cancelled = await schedule({ videoCall: true });
    await cancelMeeting(cancelled._id, 'u1');
    await expect(getMeetingVideoCallUrl(cancelled._id, 'u1')).rejects.toMatchObject({
      extensions: { code: 'CONFLICT' },
    });
  });

  it('counts the people in the call from the room census', async () => {
    const meeting = await schedule({ videoCall: true });
    getVideoConfig.mockReturnValue({
      url: 'https://meet.example.org',
      roomSecret: 'secret',
      censusUrl: 'https://census.example.org',
    });
    const room = buildRoomName('secret', meetingRoomKey(meeting._id));
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ room_census: [{ room_name: `${room}@muc.meet`, participants: 3 }] }),
      })
    );

    expect(await getMeetingVideoCallParticipantCount(meeting._id, 'u1')).toBe(3);
    vi.unstubAllGlobals();
  });

  it('cannot count people without a census', async () => {
    const meeting = await schedule({ videoCall: true });
    expect(await getMeetingVideoCallParticipantCount(meeting._id, 'u1')).toBeNull();
  });
});
