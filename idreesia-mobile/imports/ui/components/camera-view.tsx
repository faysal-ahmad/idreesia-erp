import React, { useEffect, useRef, useState } from 'react';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { CameraOutline, CloseOutline, LoopOutline } from 'antd-mobile-icons';

interface Props {
  /** Called with the captured frame (a canvas), or null when cancelled. */
  onDone: (frame: HTMLCanvasElement | null) => void;
}

const cameraErrorMessage = (error: unknown) => {
  const name = (error as { name?: string } | null)?.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') {
    return 'Camera access was denied. Allow the camera for this app and try again.';
  }
  if (name === 'NotReadableError') {
    return 'The camera is being used by another app. Close it and try again.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No camera was found on this device.';
  }
  return 'The camera could not be started.';
};

type FacingMode = 'environment' | 'user';

/**
 * Full-screen live camera with a shutter button and, on devices with more
 * than one camera, a button to switch between the back and front cameras.
 * Used in the browser build and the iOS app.
 * Only a photo taken here can be used: there is deliberately no way to pick
 * an existing image.
 */
export const CameraView = ({ onDone }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Starts with the back camera; the switch button flips to the front one.
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');
  // Device labels and counts are only reliable once access is granted, so
  // this is checked after the first stream starts.
  const [canSwitch, setCanSwitch] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 } },
      })
      .then(mediaStream => {
        if (cancelled) {
          mediaStream.getTracks().forEach(track => track.stop());
          return undefined;
        }
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
        return navigator.mediaDevices.enumerateDevices();
      })
      .then(devices => {
        if (cancelled || !devices) return;
        setCanSwitch(devices.filter(device => device.kind === 'videoinput').length > 1);
      })
      .catch(err => setError(cameraErrorMessage(err)));

    if (!navigator.mediaDevices) setError(cameraErrorMessage(null));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, [facingMode]);

  const switchCamera = () => {
    setReady(false);
    setFacingMode(current => (current === 'environment' ? 'user' : 'environment'));
  };

  const capture = () => {
    const video = videoRef.current;
    if (!video?.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    onDone(canvas);
  };

  return (
    <div className="camera-view" role="dialog" aria-label="Camera">
      {error ? (
        <div className="camera-view-error">
          <ErrorBlock description={error} status="default" title="Camera unavailable" />
        </div>
      ) : (
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          // Mirrored like a mirror for the front camera; the photo itself isn't.
          className={facingMode === 'user' ? 'camera-view-video camera-view-video-mirrored' : 'camera-view-video'}
          onLoadedData={() => setReady(true)}
        />
      )}
      {!ready && !error && (
        <div className="camera-view-loading">
          <SpinLoading color="white" />
        </div>
      )}
      <div className="camera-view-controls">
        <button
          aria-label="Cancel"
          className="camera-view-cancel"
          type="button"
          onClick={() => onDone(null)}
        >
          <CloseOutline />
        </button>
        <button
          aria-label="Take photo"
          className="camera-view-shutter"
          disabled={!ready}
          type="button"
          onClick={capture}
        >
          <CameraOutline />
        </button>
        {canSwitch && !error ? (
          <button
            aria-label="Switch camera"
            className="camera-view-switch"
            disabled={!ready}
            type="button"
            onClick={switchCamera}
          >
            <LoopOutline />
          </button>
        ) : (
          <span className="camera-view-spacer" />
        )}
      </div>
    </div>
  );
};
