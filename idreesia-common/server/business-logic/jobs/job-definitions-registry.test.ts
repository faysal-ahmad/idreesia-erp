import { beforeEach, describe, expect, it, vi } from 'vitest';

const publishExpiringLockNotifications = vi.fn(async () => 0);
const purgeNotifications = vi.fn(async () => 0);

vi.mock('meteor/idreesia-common/server/business-logic/dms', () => ({
  publishExpiringLockNotifications,
}));
vi.mock('meteor/idreesia-common/server/headless', () => ({
  purgeNotifications,
}));
// The other jobs pull in heavy, unrelated code.
vi.mock('meteor/idreesia-common/server/business-logic/hr/create-monthly-salaries', () => ({}));
vi.mock('meteor/idreesia-common/server/business-logic/common/backfill-image-vector-data', () => ({}));
vi.mock('meteor/idreesia-common/server/business-logic/common/backfill-image-thumbnails', () => ({}));
vi.mock('meteor/idreesia-common/server/business-logic/common/move-images-to-storage', () => ({}));
vi.mock('meteor/idreesia-common/server/business-logic/common/remove-migrated-images-from-db', () => ({}));
vi.mock('meteor/idreesia-common/server/business-logic/hr/duty-planning', () => ({}));
vi.mock('./system-user', () => ({ getSystemUser: vi.fn() }));
vi.mock('./report-progress', () => ({ createProgressReporter: vi.fn() }));

const { default: registry } = await import('./job-definitions-registry');

const job = (name: string) => registry.find(entry => entry.name === name)!;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('notification jobs', () => {
  it('publishes DMS lock expiring notifications every hour', async () => {
    const definition = job('publish-dms-lock-expiring-notifications');

    expect(definition.defaultSchedule).toBe('0 * * * *');
    await definition.handler({} as any);
    expect(publishExpiringLockNotifications).toHaveBeenCalledTimes(1);
  });

  it('purges old notifications once a day', async () => {
    const definition = job('purge-notifications');

    expect(definition.defaultSchedule).toBe('15 3 * * *');
    await definition.handler({} as any);
    expect(purgeNotifications).toHaveBeenCalledTimes(1);
  });

  it('has a unique name for every job', () => {
    const names = registry.map(entry => entry.name);
    expect(new Set(names).size).toBe(names.length);
  });
});
