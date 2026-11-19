import { useDiscussionContext } from './discussion-context';

/**
 * Starts joining the discussion's video call by opening the screen before it
 * (see video-call-popup.tsx). `join` is undefined for people who can't post,
 * since they can't join calls.
 */
export const useJoinVideoCall = () => {
  const { canPost, setVideoCallOpen } = useDiscussionContext();
  return { join: canPost ? () => setVideoCallOpen(true) : undefined };
};
