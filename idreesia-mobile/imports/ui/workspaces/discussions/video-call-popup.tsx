import React, { useEffect, useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Button, List, Popup, SpinLoading, Switch } from 'antd-mobile';

import { useCurrentUser } from '../../hooks';
import { showError } from '../../layout';
import { openVideoCall } from '../../utilities/open-video-call';
import { useDiscussionContext } from './discussion-context';

const describeParticipants = (count: number | null | undefined) => {
  if (count == null) return "Couldn't check who is in the call.";
  if (count === 0) return "Nobody is in the call yet. You'll start it.";
  return count === 1 ? '1 person is in the call.' : `${count} people are in the call.`;
};

/**
 * The screen before a video call: who is already in it, and whether to join
 * with the microphone and camera on. The call opens when the user taps Join.
 */
export const VideoCallPopup = () => {
  const { scope, actions, videoCallOpen, setVideoCallOpen } = useDiscussionContext();
  const { user } = useCurrentUser();
  const displayName = user?.karkun?.sharedData?.name ?? user?.displayName ?? user?.username;
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [joining, setJoining] = useState(false);

  // Looked up each time the screen opens: it changes as people come and go.
  const info = useQuery(scope.docs.videoCallInfo, {
    variables: scope.variables,
    skip: !videoCallOpen,
    fetchPolicy: 'network-only',
  });
  const count = info.error ? null : info.data?.workspaceDiscussionVideoCallInfo?.participantCount;

  useEffect(() => {
    if (!videoCallOpen) setJoining(false);
  }, [videoCallOpen]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const url = await actions.joinVideoCall();
      setVideoCallOpen(false);
      openVideoCall(url, { displayName, audioMuted: !microphoneOn, videoMuted: !cameraOn });
    } catch (error) {
      showError(error, 'Could not join the video call.');
      setJoining(false);
    }
  };

  return (
    <Popup
      bodyClassName="discussion-video-popup"
      visible={videoCallOpen}
      onMaskClick={() => !joining && setVideoCallOpen(false)}
    >
      <div className="discussion-edit-title">Video call</div>
      <div className="discussion-video-count">
        {info.loading && !info.data ? <SpinLoading style={{ '--size': '20px' }} /> : describeParticipants(count)}
      </div>
      <List>
        <List.Item extra={<Switch checked={microphoneOn} onChange={setMicrophoneOn} />}>Microphone</List.Item>
        <List.Item extra={<Switch checked={cameraOn} onChange={setCameraOn} />}>Camera</List.Item>
      </List>
      <div className="discussion-edit-actions">
        <Button block disabled={joining} fill="outline" onClick={() => setVideoCallOpen(false)}>
          Cancel
        </Button>
        <Button block color="primary" loading={joining} onClick={handleJoin}>
          Join call
        </Button>
      </div>
    </Popup>
  );
};
