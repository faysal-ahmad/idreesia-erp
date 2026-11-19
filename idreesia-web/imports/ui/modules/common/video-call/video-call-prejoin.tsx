import React, { useEffect, useState } from 'react';
import { Modal, Spin, Switch } from 'antd';

import { message as toast } from '/imports/ui/antd-feedback';

export interface PrejoinSettings {
  microphoneOn: boolean;
  cameraOn: boolean;
}

interface Props {
  title?: React.ReactNode;
  loadParticipantCount?(): Promise<number | null>;
  /** Joins the call; rejects when it can't. */
  onJoin(settings: PrejoinSettings): Promise<void>;
  onCancel(): void;
}

const describeParticipants = (count: number | null) => {
  if (count === null) return "Couldn't check who is in the call.";
  if (count === 0) return "Nobody is in the call yet. You'll start it.";
  return count === 1 ? '1 person is in the call.' : `${count} people are in the call.`;
};

/**
 * Shown before a video call starts: who is already in it, and whether to
 * join with the microphone and camera on. The call starts on Join.
 */
const VideoCallPrejoin = ({ title, loadParticipantCount, onJoin, onCancel }: Props) => {
  // undefined while loading; null when it can't be told.
  const [count, setCount] = useState<number | null | undefined>(
    loadParticipantCount ? undefined : null
  );
  const [microphoneOn, setMicrophoneOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    if (!loadParticipantCount) return undefined;
    let cancelled = false;
    loadParticipantCount()
      .then(loaded => !cancelled && setCount(loaded))
      .catch(() => !cancelled && setCount(null));
    return () => {
      cancelled = true;
    };
  }, [loadParticipantCount]);

  const handleJoin = async () => {
    setJoining(true);
    try {
      await onJoin({ microphoneOn, cameraOn });
    } catch (error) {
      toast.error((error as Error)?.message || 'Could not join the video call.', 5);
      setJoining(false);
    }
  };

  return (
    <Modal
      open
      title={title ? <>Video call: {title}</> : 'Video call'}
      okText="Join call"
      cancelText="Cancel"
      onOk={handleJoin}
      onCancel={onCancel}
      confirmLoading={joining}
      cancelButtonProps={{ disabled: joining }}
      maskClosable={false}
      width={420}
    >
      <div className="video-call-prejoin">
        <div className="video-call-prejoin-count">
          {count === undefined ? <Spin size="small" /> : describeParticipants(count)}
        </div>
        <div className="video-call-prejoin-option">
          <span id="video-call-microphone-label">Microphone</span>
          <Switch
            aria-labelledby="video-call-microphone-label"
            checked={microphoneOn}
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={setMicrophoneOn}
          />
        </div>
        <div className="video-call-prejoin-option">
          <span id="video-call-camera-label">Camera</span>
          <Switch
            aria-labelledby="video-call-camera-label"
            checked={cameraOn}
            checkedChildren="On"
            unCheckedChildren="Off"
            onChange={setCameraOn}
          />
        </div>
      </div>
    </Modal>
  );
};

export default VideoCallPrejoin;
