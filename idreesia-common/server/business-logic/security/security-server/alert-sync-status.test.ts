import { describe, expect, it } from 'vitest';

import {
  getSecurityServerAlertLastSyncedAt,
  recordSecurityServerAlertSync,
} from './alert-sync-status';

describe('alert sync status', () => {
  it('is null until the security server first checks in', async () => {
    expect(await getSecurityServerAlertLastSyncedAt()).toBeNull();
  });

  it('records the check-in time and keeps a single record', async () => {
    const before = Date.now();
    await recordSecurityServerAlertSync();
    const first = (await getSecurityServerAlertLastSyncedAt())!;
    expect(first.getTime()).toBeGreaterThanOrEqual(before);

    await new Promise<void>(resolve => {
      setTimeout(resolve, 5);
    });
    await recordSecurityServerAlertSync();
    const second = (await getSecurityServerAlertLastSyncedAt())!;
    expect(second.getTime()).toBeGreaterThan(first.getTime());
  });
});
