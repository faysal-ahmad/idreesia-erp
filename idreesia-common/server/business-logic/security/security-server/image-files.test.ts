import { describe, expect, it } from 'vitest';

import { SecurityServerSyncError } from './errors';
import { getImageExtension, SUPPORTED_IMAGE_MIME_TYPES } from './image-files';

describe('getImageExtension', () => {
  it('maps the supported MIME types', () => {
    expect(getImageExtension('image/jpeg')).toBe('jpg');
    expect(getImageExtension('image/png')).toBe('png');
    expect(getImageExtension('image/webp')).toBe('webp');
    expect(SUPPORTED_IMAGE_MIME_TYPES).toEqual(['image/jpeg', 'image/png', 'image/webp']);
  });

  it('rejects anything else with a 400 sync error', () => {
    try {
      getImageExtension('image/gif');
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(SecurityServerSyncError);
      expect((error as SecurityServerSyncError).statusCode).toBe(400);
      expect((error as Error).message).toBe("Unsupported image type 'image/gif'.");
    }
  });
});
