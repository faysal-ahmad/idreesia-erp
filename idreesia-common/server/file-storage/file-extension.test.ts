import { describe, expect, it } from 'vitest';

import { getFileExtension } from './file-extension';

describe('getFileExtension', () => {
  it('uses the file name extension, lower-cased', () => {
    expect(getFileExtension('Photo.JPG', 'image/png')).toBe('jpg');
    expect(getFileExtension('archive.tar.gz', 'application/zip')).toBe('gz');
  });

  it('falls back to the MIME type when the name has no usable extension', () => {
    expect(getFileExtension('photo', 'image/png')).toBe('png');
    expect(getFileExtension(undefined, 'application/pdf')).toBe('pdf');
    expect(getFileExtension('trailing.', 'image/webp')).toBe('webp');
    expect(getFileExtension('x.waytoolongextension', 'image/gif')).toBe('gif');
  });

  it('matches the MIME type case-insensitively', () => {
    expect(getFileExtension(undefined, 'IMAGE/JPEG')).toBe('jpg');
    expect(getFileExtension(undefined, 'application/x-zip-compressed')).toBe(
      'zip'
    );
  });

  it('uses bin for an unknown MIME type', () => {
    expect(getFileExtension(undefined, 'application/x-unknown')).toBe('bin');
  });
});
