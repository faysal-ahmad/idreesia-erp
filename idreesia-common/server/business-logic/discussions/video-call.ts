import { createHmac } from 'node:crypto';

import {
  sendConversationMessage,
  type ConversationActor,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';
import { getVideoConfig } from 'meteor/idreesia-common/server/video/config';

// 128 bits of the HMAC: plenty to be unguessable, short enough for a URL.
const ROOM_NAME_LENGTH = 32;

/**
 * The Jitsi room for a chat group. Derived with a server-side secret, so it
 * is stable per discussion, cannot be guessed from the chat group id, and
 * does not reveal that id.
 */
export const buildRoomName = (secret: string, chatGroupId: string): string =>
  createHmac('sha256', secret)
    .update(chatGroupId)
    .digest('hex')
    .slice(0, ROOM_NAME_LENGTH);

// Jitsi reads these settings from the link's fragment, so every client (web
// and mobile) gets them: no "get the app" landing page on phones, no "Join
// meeting" screen (a client that never taps it never joins), and the
// microphone muted on joining. Clients add the person's name themselves.
const JOIN_SETTINGS = [
  'config.disableDeepLinking=true',
  'config.prejoinConfig.enabled=false',
  'config.startWithAudioMuted=true',
].join('&');

/** The link that joins the discussion's video call. */
export const buildVideoCallUrl = (
  baseUrl: string,
  roomSecret: string,
  chatGroupId: string
): string =>
  `${baseUrl.replace(/\/+$/, '')}/${buildRoomName(
    roomSecret,
    chatGroupId
  )}#${JOIN_SETTINGS}`;

// The marker the discussion UI turns into a "Join call" button.
export const VIDEO_CALL_ANNOUNCEMENT =
  '📹 Started a video call. [Join call](videocall://join)';

const CENSUS_TIMEOUT_MS = 3000;

interface CensusRoom {
  room_name?: string;
  participants?: number;
}

/**
 * How many people are in a Jitsi room right now, from the room census: 0 when
 * the room is not listed. Null when the census cannot be read, so callers can
 * tell "empty" from "unknown".
 */
export const getRoomParticipantCount = async (
  censusUrl: string,
  roomName: string
): Promise<number | null> => {
  try {
    const response = await fetch(censusUrl, {
      signal: AbortSignal.timeout(CENSUS_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const census = (await response.json()) as { room_census?: CensusRoom[] };
    // Room names in the census are full MUC addresses: <room>@muc.<domain>.
    const room = (census.room_census ?? []).find(
      censusRoom => censusRoom.room_name?.split('@')[0] === roomName
    );
    return room?.participants ?? 0;
  } catch {
    return null;
  }
};

/**
 * How many people are in a discussion's video call right now, for the screen
 * shown before joining. Null when it cannot be told (the census is not
 * configured or cannot be read).
 */
export const getDiscussionVideoCallParticipantCount = async (
  chatGroupId: string
): Promise<number | null> => {
  const { roomSecret, censusUrl } = getVideoConfig();
  if (!censusUrl) return null;
  return getRoomParticipantCount(censusUrl, buildRoomName(roomSecret, chatGroupId));
};

/**
 * The link that joins a discussion's video call. When nobody is in the room,
 * this person is starting the call, so it is announced in the discussion
 * (posted as them). Joining a running call, or not being able to tell, posts
 * nothing; and a failed announcement never stops the user joining.
 */
export const joinDiscussionVideoCall = async (
  chatGroupId: string,
  actor: ConversationActor
): Promise<{ url: string }> => {
  const { url, roomSecret, censusUrl } = getVideoConfig();

  if (censusUrl) {
    const roomName = buildRoomName(roomSecret, chatGroupId);
    if ((await getRoomParticipantCount(censusUrl, roomName)) === 0) {
      try {
        await sendConversationMessage(chatGroupId, actor, VIDEO_CALL_ANNOUNCEMENT);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Video call: could not announce the call:', error);
      }
    }
  }

  return { url: buildVideoCallUrl(url, roomSecret, chatGroupId) };
};
