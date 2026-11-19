import React from 'react';
import { Button, Tooltip } from 'antd';
import {
  CloseOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
} from '@ant-design/icons';

import { useLoggedInUser } from 'meteor/idreesia-common/hooks/common';

export type VideoCallMode = 'full' | 'mini';

interface Props {
  url: string;
  title?: React.ReactNode;
  mode: VideoCallMode;
  /** What the user chose on the screen before joining. */
  audioMuted: boolean;
  videoMuted: boolean;
  onModeChange(mode: VideoCallMode): void;
  /** Leaves the call and removes the window. */
  onLeave(): void;
}

// Jitsi reads settings from the link's fragment; values are JSON. The server's
// link starts muted; what the user chose before joining comes after it, and a
// later setting wins.
const withCallSettings = (
  url: string,
  displayName: string | null | undefined,
  audioMuted: boolean,
  videoMuted: boolean
) => {
  const settings = [
    `config.startWithAudioMuted=${audioMuted}`,
    `config.startWithVideoMuted=${videoMuted}`,
  ];
  if (displayName) {
    settings.push(`userInfo.displayName=${encodeURIComponent(JSON.stringify(displayName))}`);
  }
  return `${url}${url.includes('#') ? '&' : '#'}${settings.join('&')}`;
};

/**
 * The embedded call: the whole window, or a small window in the top right
 * corner so the user can keep working. It is one element whose size changes
 * with `mode`, so the iframe is never remounted (which would drop the call).
 * The `allow` list is what lets the embedded page use the camera,
 * microphone and screen sharing.
 */
const VideoCallWindow = ({
  url,
  title,
  mode,
  audioMuted,
  videoMuted,
  onModeChange,
  onLeave,
}: Props) => {
  const { user } = useLoggedInUser();
  const displayName = user?.karkun?.sharedData?.name ?? user?.displayName;
  const isFull = mode === 'full';

  return (
    <div className={`video-call video-call-${mode}`}>
      <div className="video-call-header">
        <span className="video-call-title">{title ?? 'Video call'}</span>
        <div className="video-call-actions">
          <Tooltip title={isFull ? 'Make smaller' : 'Full window'}>
            <Button
              type="text"
              size="small"
              icon={isFull ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
              onClick={() => onModeChange(isFull ? 'mini' : 'full')}
            />
          </Tooltip>
          <Tooltip title="Leave call">
            <Button type="text" size="small" danger icon={<CloseOutlined />} onClick={onLeave} />
          </Tooltip>
        </div>
      </div>
      <iframe
        className="video-call-frame"
        title="Video call"
        src={withCallSettings(url, displayName, audioMuted, videoMuted)}
        allow="camera; microphone; display-capture; autoplay; fullscreen; clipboard-write"
      />
    </div>
  );
};

export default VideoCallWindow;
