import { createHmac } from 'node:crypto';

// 128 bits of the HMAC: plenty to be unguessable, short enough for a URL.
const ROOM_NAME_LENGTH = 32;

/**
 * The Jitsi room for something that has a call (a discussion's chat group, a
 * meeting), named by `roomKey`. Derived with a server-side secret, so it is
 * stable per key, cannot be guessed from the key, and does not reveal it.
 * Keys of different kinds must not collide (meetings are prefixed).
 */
export const buildRoomName = (secret: string, roomKey: string): string =>
  createHmac('sha256', secret)
    .update(roomKey)
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

/** The link that joins the video call of `roomKey`. */
export const buildVideoCallUrl = (
  baseUrl: string,
  roomSecret: string,
  roomKey: string
): string =>
  `${baseUrl.replace(/\/+$/, '')}/${buildRoomName(
    roomSecret,
    roomKey
  )}#${JOIN_SETTINGS}`;

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

