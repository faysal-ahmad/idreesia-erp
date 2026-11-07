// Matches the server-side normalisation (person-images.ts), so a large
// phone photo is shrunk before it is sent - the base64 has to fit in the
// GraphQL request.
const MAX_IMAGE_SIDE = 1280;
const JPEG_QUALITY = 0.9;

const loadImage = (file: Blob): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('The selected file is not a valid image.'));
    };
    image.src = url;
  });

/**
 * Reads an image file as base64 JPEG data (without the data: prefix),
 * scaled down to fit within MAX_IMAGE_SIDE.
 */
export default async function readImageFile(file: Blob): Promise<string> {
  const image = await loadImage(file);
  const scale = Math.min(
    1,
    MAX_IMAGE_SIDE / Math.max(image.naturalWidth, image.naturalHeight)
  );
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(image.naturalWidth * scale);
  canvas.height = Math.round(image.naturalHeight * scale);
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not read the selected image.');
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  return dataUrl.replace(/^data:[^;]+;base64,/, '');
}
