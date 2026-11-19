import React, { useEffect, useState } from 'react';
import { Button, List, Popup, SpinLoading, Switch } from 'antd-mobile';

import { useCurrentUser } from '../../hooks';
import { showError } from '../../layout';
import { openVideoCall } from '../../utilities/open-video-call';

const describeParticipants = (count: number | null | undefined) => {
  if (count == null) return "Couldn't check who is in the call.";
  if (count === 0) return "Nobody is in the call yet. You'll start it.";
  return count === 1 ? '1 person is in the call.' : `${count} people are in the call.`;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  /** People in the call now; undefined while loading, null when unknown. */
  participantCount: number | null | undefined;
  loading: boolean;
  /** Gets the call link; may announce a call that is starting. */
  join: () => Promise<string>;
}

/**
 * The screen before a video call: who is already in it, and whether to join
 * with the microphone and camera on. The call opens when the user taps Join.
 * Shared by every feature with video calls (discussions, meetings).
 */
export const VideoCallPrejoinPopup = ({ visible, onClose, participantCount, loading, join }: Props) => {
  const { user } = useCurrentUser();
  const displayName = user?.karkun?.sharedData?.name ?? user?.displayName ?? user?.username;
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!visible) setJoining(false);
  }, [visible]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      const url = await join();
      onClose();
      openVideoCall(url, { displayName, audioMuted: !microphoneOn, videoMuted: !cameraOn });
    } catch (error) {
      showError(error, 'Could not join the video call.');
      setJoining(false);
    }
  };

  return (
    <Popup bodyClassName="video-call-popup" visible={visible} onMaskClick={() => !joining && onClose()}>
      <div className="video-call-popup-title">Video call</div>
      <div className="video-call-popup-count">
        {loading && participantCount === undefined ? (
          <SpinLoading style={{ '--size': '20px' }} />
        ) : (
          describeParticipants(participantCount)
        )}
      </div>
      <List>
        <List.Item extra={<Switch checked={microphoneOn} onChange={setMicrophoneOn} />}>Microphone</List.Item>
        <List.Item extra={<Switch checked={cameraOn} onChange={setCameraOn} />}>Camera</List.Item>
      </List>
      <div className="video-call-popup-actions">
        <Button block disabled={joining} fill="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button block color="primary" loading={joining} onClick={handleJoin}>
          Join call
        </Button>
      </div>
    </Popup>
  );
};
