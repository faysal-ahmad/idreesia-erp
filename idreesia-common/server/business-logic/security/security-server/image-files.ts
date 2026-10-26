import { SecurityServerSyncError } from './errors';

const EXTENSIONS_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const SUPPORTED_IMAGE_MIME_TYPES = Object.keys(EXTENSIONS_BY_MIME_TYPE);

export function getImageExtension(mimeType: string): string {
  const extension = EXTENSIONS_BY_MIME_TYPE[mimeType];
  if (!extension) {
    throw new SecurityServerSyncError(
      400,
      `Unsupported image type '${mimeType}'.`
    );
  }
  return extension;
}
