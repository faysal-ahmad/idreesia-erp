import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import VideoCallPrejoin, { type PrejoinSettings } from './video-call-prejoin';
import VideoCallWindow, { type VideoCallMode } from './video-call-window';

export interface VideoCallRequest {
  /**
   * Identifies the discussion. Asking again for a discussion whose call is
   * already running just brings that call back, instead of joining twice.
   */
  key: unknown;
  title?: React.ReactNode;
  /** People in the call now, shown before joining; null when unknown. */
  loadParticipantCount?(): Promise<number | null>;
  /** Gets the call link; may announce a call that is starting. */
  join(): Promise<string>;
}

interface ActiveCall {
  key: unknown;
  url: string;
  title: React.ReactNode;
  mode: VideoCallMode;
  audioMuted: boolean;
  videoMuted: boolean;
}

interface VideoCallApi {
  /**
   * Shows the screen before a call (who is in it, microphone and camera
   * choices); the call starts when the user presses Join.
   */
  requestCall(request: VideoCallRequest): void;
}

const VideoCallContext = createContext<VideoCallApi | null>(null);

export const useVideoCall = (): VideoCallApi => {
  const api = useContext(VideoCallContext);
  if (!api) throw new Error('useVideoCall needs a VideoCallProvider.');
  return api;
};

/**
 * Owns the one video call and renders it above the whole app, so it keeps
 * running while the user moves between pages. Mount it once, around the
 * routes.
 */
export const VideoCallProvider = ({ children }: { children: React.ReactNode }) => {
  const [call, setCall] = useState<ActiveCall | null>(null);
  const [request, setRequest] = useState<VideoCallRequest | null>(null);

  const requestCall = useCallback(
    (next: VideoCallRequest) => {
      if (!call || call.key !== next.key) {
        // Not in this discussion's call: show the screen before joining.
        setRequest(next);
        return;
      }
      // Already in it: just bring it back to full window.
      setCall({ ...call, mode: 'full' });
    },
    [call]
  );

  const handleJoin = useCallback(
    async (settings: PrejoinSettings) => {
      if (!request) return;
      const url = await request.join();
      setCall({
        key: request.key,
        url,
        title: request.title,
        mode: 'full',
        audioMuted: !settings.microphoneOn,
        videoMuted: !settings.cameraOn,
      });
      setRequest(null);
    },
    [request]
  );

  const api = useMemo(() => ({ requestCall }), [requestCall]);

  return (
    <VideoCallContext.Provider value={api}>
      {children}
      {request ? (
        <VideoCallPrejoin
          title={request.title}
          loadParticipantCount={request.loadParticipantCount}
          onJoin={handleJoin}
          onCancel={() => setRequest(null)}
        />
      ) : null}
      {call ? (
        <VideoCallWindow
          key={call.url}
          url={call.url}
          title={call.title}
          mode={call.mode}
          audioMuted={call.audioMuted}
          videoMuted={call.videoMuted}
          onModeChange={mode => setCall(current => (current ? { ...current, mode } : current))}
          onLeave={() => setCall(null)}
        />
      ) : null}
    </VideoCallContext.Provider>
  );
};
