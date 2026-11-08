import {
  cordovaPlatform,
  getCordovaCamera,
  getCordovaPicture,
  toScaledJpegDataUrl,
} from './capture-photo';

// Picks an existing photo from the device's gallery and returns it as a JPEG
// data URL, scaled down like capturePhoto()'s. Resolves to null when the user
// cancels (on browsers that report a cancel; elsewhere it never resolves,
// which is harmless as nothing waits on it). Only for features where an
// existing photo is acceptable - see the camera rules in
// docs/mobile-ui-design-guidelines.md.
//
// - The Android app uses cordova-plugin-camera's photo library source, as
//   capturePhoto() uses its camera there.
// - The browser build and the iOS app use a file input limited to images. On
//   iOS that opens the system photo picker (no permission prompt needed).

const decodeFile = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      // Drawing an <img> applies its EXIF orientation, so the photo is upright.
      resolve(toScaledJpegDataUrl(image, image.naturalWidth, image.naturalHeight));
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('This photo could not be opened. Try another.'));
    };
    image.src = url;
  });

const pickWithFileInput = () =>
  new Promise<string | null>((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    const cleanUp = () => input.remove();

    input.addEventListener('change', () => {
      const file = input.files?.[0];
      cleanUp();
      if (!file) {
        resolve(null);
        return;
      }
      decodeFile(file).then(resolve, reject);
    });
    input.addEventListener('cancel', () => {
      cleanUp();
      resolve(null);
    });

    // Attached so the click counts in every WebView; removed once done.
    document.body.appendChild(input);
    input.click();
  });

export const pickPhoto = (): Promise<string | null> => {
  const camera = getCordovaCamera();
  if (camera && cordovaPlatform() === 'android') return getCordovaPicture(camera, 'library');
  return pickWithFileInput();
};
