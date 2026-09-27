import React, { useEffect, useRef, useState } from 'react';
import { ErrorBlock, SpinLoading } from 'antd-mobile';
import { CameraOutline, CloseOutline } from 'antd-mobile-icons';

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

/**
 * Full-screen live camera with a shutter button, for the browser build.
 * Only a photo taken here can be used: there is deliberately no way to pick
 * an existing image.
 */
export const CameraView = ({ onDone }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      ?.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
      })
      .then(mediaStream => {
        if (cancelled) {
          mediaStream.getTracks().forEach(track => track.stop());
          return;
        }
        stream = mediaStream;
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      })
      .catch(err => setError(cameraErrorMessage(err)));

    if (!navigator.mediaDevices) setError(cameraErrorMessage(null));

    return () => {
      cancelled = true;
      stream?.getTracks().forEach(track => track.stop());
    };
  }, []);

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
          className="camera-view-video"
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
        <span className="camera-view-spacer" />
      </div>
    </div>
  );
};
