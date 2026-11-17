import React from 'react';
import { useQuery } from '@apollo/client/react';

import { VideoCallPrejoinPopup } from '../../components/video-call';
import { useDiscussionContext } from './discussion-context';

/** The discussion's screen before a video call. */
export const VideoCallPopup = () => {
  const { scope, actions, videoCallOpen, setVideoCallOpen } = useDiscussionContext();

  // Looked up each time the screen opens: it changes as people come and go.
  const info = useQuery(scope.docs.videoCallInfo, {
    variables: scope.variables,
    skip: !videoCallOpen,
    fetchPolicy: 'network-only',
  });
  const count = info.error ? null : info.data?.workspaceDiscussionVideoCallInfo?.participantCount;

  return (
    <VideoCallPrejoinPopup
      join={actions.joinVideoCall}
      loading={info.loading}
      participantCount={info.loading && !info.data ? undefined : count}
      visible={videoCallOpen}
      onClose={() => setVideoCallOpen(false)}
    />
  );
};
