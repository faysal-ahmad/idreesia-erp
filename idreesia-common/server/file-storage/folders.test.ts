import { describe, expect, it } from 'vitest';

import { StorageFolders } from './folders';

describe('StorageFolders', () => {
  it('has unique, URL-safe folder names', () => {
    const values = Object.values(StorageFolders);
    expect(new Set(values).size).toBe(values.length);
    for (const value of values) {
      expect(value).toMatch(/^[a-z0-9-]+$/);
    }
  });
});
