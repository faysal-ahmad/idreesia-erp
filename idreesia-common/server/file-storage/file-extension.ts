const MIME_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
  'application/zip': 'zip',
  'application/x-zip-compressed': 'zip',
};

/** The original file's extension, else one for its MIME type. */
export const getFileExtension = (
  name: string | undefined,
  mimeType: string
) => {
  const fromName = name?.match(/\.([a-z0-9]{1,10})$/i)?.[1];
  if (fromName) return fromName.toLowerCase();
  return MIME_EXTENSIONS[mimeType?.toLowerCase()] ?? 'bin';
};
