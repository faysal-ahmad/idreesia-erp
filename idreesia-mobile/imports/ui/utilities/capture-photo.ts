import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

import { CameraView } from '../components/camera-view';

// Takes a photo with the device camera and returns it as a JPEG data URL,
// scaled down so uploads stay small (the GraphQL body limit is 5 MB, and a
// face search doesn't need more than ~1 megapixel). Resolves to null when the
// user cancels. Camera only: picking an existing image is deliberately not
// offered.
//
// - The browser build and the iOS app show a full-screen live camera
//   (CameraView). In the iOS app this avoids the native camera screen, whose
//   hand-back left the app blank for a couple of seconds; the local plugin
//   cordova-plugins/idreesia-webview-camera stops WKWebView asking for
//   permission again on every launch. (A file input would also offer the
//   gallery and files, so it isn't used.)
// - The Android app uses cordova-plugin-camera with the camera as the only
//   source, until the in-app camera has been tested in Android's WebView.

const MAX_DIMENSION = 1024;
const JPEG_QUALITY = 0.85;

interface CordovaCamera {
  getPicture(
    onSuccess: (imageData: string) => void,
    onError: (message: string) => void,
    options: Record<string, unknown>
  ): void;
}

declare const Camera: {
  DestinationType: { DATA_URL: number };
  PictureSourceType: { CAMERA: number };
  EncodingType: { JPEG: number };
  Direction: { BACK: number };
};

const getCordovaCamera = () =>
  (navigator as Navigator & { camera?: CordovaCamera }).camera;

const cordovaPlatform = () =>
  (window as Window & { cordova?: { platformId?: string } }).cordova?.platformId;

const captureWithCordova = (camera: CordovaCamera) =>
  new Promise<string | null>((resolve, reject) => {
    camera.getPicture(
      imageData => resolve(`data:image/jpeg;base64,${imageData}`),
      message => {
        // The plugin reports a cancel as an error with a message like
        // "No Image Selected" / "Camera cancelled".
        if (/cancel|no image/i.test(message)) resolve(null);
        else reject(new Error(message));
      },
      {
        quality: Math.round(JPEG_QUALITY * 100),
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        encodingType: Camera.EncodingType.JPEG,
        cameraDirection: Camera.Direction.BACK,
        targetWidth: MAX_DIMENSION,
        targetHeight: MAX_DIMENSION,
        correctOrientation: true,
        saveToPhotoAlbum: false,
      }
    );
  });

/** Scales a captured frame down to MAX_DIMENSION and encodes it as JPEG. */
const toScaledJpegDataUrl = (frame: HTMLCanvasElement) => {
  const scale = Math.min(1, MAX_DIMENSION / Math.max(frame.width, frame.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(frame.width * scale);
  canvas.height = Math.round(frame.height * scale);
  canvas.getContext('2d')?.drawImage(frame, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
};

const captureWithCameraView = () =>
  new Promise<string | null>(resolve => {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const root = createRoot(host);
    const onDone = (frame: HTMLCanvasElement | null) => {
      root.unmount();
      host.remove();
      resolve(frame ? toScaledJpegDataUrl(frame) : null);
    };
    root.render(createElement(CameraView, { onDone }));
  });

export const capturePhoto = (): Promise<string | null> => {
  const camera = getCordovaCamera();
  if (camera && cordovaPlatform() === 'android') return captureWithCordova(camera);
  return captureWithCameraView();
};
