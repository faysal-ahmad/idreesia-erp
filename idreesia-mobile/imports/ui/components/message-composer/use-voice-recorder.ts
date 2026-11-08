import { useCallback, useEffect, useRef, useState } from 'react';

const MAX_DURATION_MS = 2 * 60 * 1000;

// iOS WebKit records AAC in MP4; Chrome/Android record Opus in WebM.
const MIME_CANDIDATES = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus'];

const extensionFor = (mimeType: string) => {
  if (mimeType.startsWith('audio/mp4')) return 'm4a';
  if (mimeType.startsWith('audio/ogg')) return 'ogg';
  return 'webm';
};

interface AndroidPermissions {
  RECORD_AUDIO: string;
  requestPermission: (
    permission: string,
    success: (status: { hasPermission: boolean }) => void,
    error: () => void
  ) => void;
}

/**
 * Android's WebView grants getUserMedia only if the app itself holds
 * RECORD_AUDIO, which must be requested at runtime
 * (cordova-plugin-android-permissions). iOS and the browser ask on their own.
 */
const ensureMicrophonePermission = () =>
  new Promise<boolean>(resolve => {
    const cordova = (window as Window & {
      cordova?: { platformId?: string; plugins?: { permissions?: AndroidPermissions } };
    }).cordova;
    const permissions = cordova?.plugins?.permissions;
    if (cordova?.platformId !== 'android' || !permissions) {
      resolve(true);
      return;
    }
    permissions.requestPermission(
      permissions.RECORD_AUDIO,
      status => resolve(status.hasPermission),
      () => resolve(false)
    );
  });

export interface VoiceRecording {
  blob: Blob;
  fileName: string;
}

/**
 * Records a voice note with the microphone (getUserMedia + MediaRecorder).
 * `stop()` hands the recording to `onRecorded`; `cancel()` discards it.
 * Recording stops by itself after 2 minutes.
 *
 * Built for press-and-hold: `stop()`/`cancel()` may arrive while `start()` is
 * still waiting for the microphone (e.g. the first-use permission prompt).
 * Such an early release discards the recording as soon as it begins.
 */
export const useVoiceRecorder = (onRecorded: (recording: VoiceRecording) => void) => {
  const [recording, setRecording] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const discard = useRef(false);
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null);
  const starting = useRef(false);
  const releasedWhileStarting = useRef(false);
  const startedAt = useRef(0);
  const onRecordedRef = useRef(onRecorded);
  onRecordedRef.current = onRecorded;

  const releaseMicrophone = useCallback(() => {
    if (ticker.current) clearInterval(ticker.current);
    ticker.current = null;
    stream.current?.getTracks().forEach(track => track.stop());
    stream.current = null;
    recorder.current = null;
    setRecording(false);
  }, []);

  const stop = useCallback(() => {
    if (starting.current) {
      releasedWhileStarting.current = true;
      return;
    }
    if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    discard.current = true;
    stop();
  }, [stop]);

  /** How long the current recording has been running, in ms (0 if none). */
  const getElapsedMs = useCallback(
    () => (recorder.current && startedAt.current ? Date.now() - startedAt.current : 0),
    []
  );

  const start = useCallback(async () => {
    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      throw new Error('Voice notes are not supported on this device.');
    }
    const mimeType = MIME_CANDIDATES.find(type => MediaRecorder.isTypeSupported(type));

    starting.current = true;
    releasedWhileStarting.current = false;
    let media: MediaStream;
    try {
      if (!(await ensureMicrophonePermission())) {
        throw new Error('Microphone access is needed to record a voice note.');
      }
      try {
        media = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch {
        throw new Error('Microphone access is needed to record a voice note.');
      }
    } finally {
      starting.current = false;
    }

    const mediaRecorder = new MediaRecorder(media, mimeType ? { mimeType } : undefined);
    chunks.current = [];
    discard.current = false;
    stream.current = media;
    recorder.current = mediaRecorder;

    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) chunks.current.push(event.data);
    };
    mediaRecorder.onstop = () => {
      const type = mediaRecorder.mimeType || mimeType || 'audio/webm';
      const blob = new Blob(chunks.current, { type });
      const discarded = discard.current;
      startedAt.current = 0;
      releaseMicrophone();
      if (!discarded && blob.size > 0) {
        onRecordedRef.current({ blob, fileName: `voice-note.${extensionFor(type)}` });
      }
    };

    mediaRecorder.start();
    startedAt.current = Date.now();
    setElapsedSeconds(0);
    setRecording(true);
    ticker.current = setInterval(() => {
      const elapsed = Date.now() - startedAt.current;
      setElapsedSeconds(Math.floor(elapsed / 1000));
      if (elapsed >= MAX_DURATION_MS) stop();
    }, 250);

    // Let go before the microphone was ready: nothing worth sending.
    if (releasedWhileStarting.current) {
      discard.current = true;
      mediaRecorder.stop();
      return false;
    }
    return true;
  }, [releaseMicrophone, stop]);

  // Never leave the microphone on after leaving the screen.
  useEffect(
    () => () => {
      discard.current = true;
      if (recorder.current && recorder.current.state !== 'inactive') recorder.current.stop();
      releaseMicrophone();
    },
    [releaseMicrophone]
  );

  return { recording, elapsedSeconds, start, stop, cancel, getElapsedMs };
};
