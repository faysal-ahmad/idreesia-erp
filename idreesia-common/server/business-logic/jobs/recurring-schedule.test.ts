import { beforeEach, describe, expect, it, vi } from 'vitest';

import { JobDefinitions } from 'meteor/idreesia-common/server/collections/admin';

const agenda = vi.hoisted(() => ({
  every: vi.fn(async () => undefined),
  disable: vi.fn(async () => undefined),
}));
vi.mock('./agenda-instance', () => ({ default: agenda }));

const { scheduleRecurringJobs } = await import('./recurring-schedule');

const define = (name: string, extra: Record<string, unknown> = {}) =>
  (JobDefinitions.rawCollection() as any).insertOne({
    _id: name,
    name,
    enabled: true,
    ...extra,
  } as any);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scheduleRecurringJobs', () => {
  it('does nothing without definitions', async () => {
    await scheduleRecurringJobs();
    expect(agenda.every).not.toHaveBeenCalled();
  });

  it('registers each scheduled definition under its name', async () => {
    await define('a', { schedule: '0 * * * *' });
    await define('b', { schedule: '5 minutes' });
    await scheduleRecurringJobs();
    expect(agenda.every).toHaveBeenCalledTimes(2);
    expect(agenda.every).toHaveBeenCalledWith('0 * * * *', 'a');
    expect(agenda.every).toHaveBeenCalledWith('5 minutes', 'b');
    expect(agenda.disable).not.toHaveBeenCalled();
  });

  it('skips manual-only definitions without a schedule', async () => {
    await define('manual');
    await define('empty', { schedule: '' });
    await scheduleRecurringJobs();
    expect(agenda.every).not.toHaveBeenCalled();
    expect(agenda.disable).not.toHaveBeenCalled();
  });

  it('registers a disabled definition, then disables it', async () => {
    await define('off', { schedule: '1 hour', enabled: false });
    await scheduleRecurringJobs();
    expect(agenda.every).toHaveBeenCalledWith('1 hour', 'off');
    expect(agenda.disable).toHaveBeenCalledWith({ name: 'off' });
    expect(agenda.every.mock.invocationCallOrder[0]).toBeLessThan(
      agenda.disable.mock.invocationCallOrder[0]
    );
  });
});
