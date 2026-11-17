import {
  sendConversationMessage,
  type ConversationActor,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';
import { getVideoConfig } from 'meteor/idreesia-common/server/video/config';
import {
  buildRoomName,
  buildVideoCallUrl,
  getRoomParticipantCount,
} from 'meteor/idreesia-common/server/video/room';

export { buildRoomName, buildVideoCallUrl, getRoomParticipantCount };

// The marker the discussion UI turns into a "Join call" button.
export const VIDEO_CALL_ANNOUNCEMENT =
  '📹 Started a video call. [Join call](videocall://join)';

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
