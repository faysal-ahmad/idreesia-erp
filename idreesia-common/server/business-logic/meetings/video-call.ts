import { MeetingStatus } from 'meteor/idreesia-common/constants/meetings';
import { getVideoConfig } from 'meteor/idreesia-common/server/video/config';
import {
  buildRoomName,
  buildVideoCallUrl,
  getRoomParticipantCount,
} from 'meteor/idreesia-common/server/video/room';

import { meetingsError } from './errors';
import { requireMeeting, requireUserId } from './internal';

/**
 * The room key of a meeting's call. Prefixed so it can never equal another
 * kind of key (a discussion's is a chat group id): the same meeting always
 * gets the same room, and nothing else shares it.
 */
export const meetingRoomKey = (meetingId: string) => `meeting:${meetingId}`;

const requireCallableMeeting = async (meetingId: string) => {
  const meeting = await requireMeeting(meetingId);
  if (!meeting.videoCall) {
    throw meetingsError('BAD_USER_INPUT', 'This meeting is not a video call');
  }
  if (meeting.status === MeetingStatus.CANCELLED) {
    throw meetingsError('CONFLICT', 'This meeting is cancelled');
  }
  return meeting;
};

/**
 * How many people are in a meeting's video call right now, for the screen
 * shown before joining. Null when it cannot be told (the census is not
 * configured or cannot be read).
 */
export async function getMeetingVideoCallParticipantCount(
  meetingId: string,
  userId: string
): Promise<number | null> {
  requireUserId(userId);
  await requireCallableMeeting(meetingId);
  const { roomSecret, censusUrl } = getVideoConfig();
  if (!censusUrl) return null;
  return getRoomParticipantCount(
    censusUrl,
    buildRoomName(roomSecret, meetingRoomKey(meetingId))
  );
}

/** The link that joins a meeting's video call. */
export async function getMeetingVideoCallUrl(
  meetingId: string,
  userId: string
): Promise<{ url: string }> {
  requireUserId(userId);
  await requireCallableMeeting(meetingId);
  const { url, roomSecret } = getVideoConfig();
  return { url: buildVideoCallUrl(url, roomSecret, meetingRoomKey(meetingId)) };
}
