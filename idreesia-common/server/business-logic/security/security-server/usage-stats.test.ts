import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  SecurityServerChannels,
  SecurityServerUsageChannelStats,
  SecurityServerUsageServerStats,
} from 'meteor/idreesia-common/server/collections/security';

import {
  getSecurityServerUsageSummary,
  upsertSecurityServerUsageStats,
} from './usage-stats';

const NOW = new Date('2024-06-01T12:00:00Z');
const minutesAgo = (minutes: number) => new Date(NOW.getTime() - minutes * 60_000);

const serverValues = (overrides: Record<string, unknown> = {}) => ({
  windowCount: 5,
  coveredSeconds: 300,
  activeChannels: 2,
  dnnTarget: 'cuda',
  inferenceBusyAvgPct: 40,
  inferenceBusyMaxPct: 70,
  gpuUtilAvgPct: 50,
  gpuUtilMaxPct: 80,
  gpuMemUsedMb: 1000,
  gpuMemTotalMb: 8000,
  cpuAvgPct: 100,
  cpuCores: 8,
  eventLoopLagP95Ms: 10,
  eventLoopLagMaxMs: 30,
  ...overrides,
});

const channelValues = (channelId: string, overrides: Record<string, unknown> = {}) => ({
  channelId,
  frameWidth: 1920,
  frameHeight: 1080,
  framesRead: 3000,
  framesProcessed: 900,
  skippedFps: 100,
  skippedBusy: 100,
  readFailures: 1,
  reconnects: 2,
  faces: 80,
  skippedFaceSize: 10,
  skippedFaceQuality: 10,
  inferenceMs: 30_000,
  ...overrides,
});

const server = SecurityServerUsageServerStats as any;
const channelStats = SecurityServerUsageChannelStats as any;

beforeEach(async () => {
  await (SecurityServerChannels.rawCollection() as any).insertMany([
    { _id: 'c1', externalId: 'ext-1', name: 'Gate', recognitionFps: 5 },
    { _id: 'c2', externalId: 'ext-2', name: 'Door', recognitionFps: 3 },
  ] as any);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('upsertSecurityServerUsageStats', () => {
  it('stores server and channel buckets, mapping channel ids to the ERP ids', async () => {
    const bucketStart = minutesAgo(10);
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart,
          server: serverValues() as any,
          channels: [channelValues('ext-1'), channelValues('ext-2')] as any,
        },
      ],
    });
    const serverRows = await server.find({}).fetchAsync();
    expect(serverRows).toHaveLength(1);
    expect(serverRows[0]).toMatchObject({ bucketStart, bucketMinutes: 5, dnnTarget: 'cuda' });
    const channelRows = await channelStats.find({}).fetchAsync();
    expect(channelRows.map((r: any) => r.channelId).sort()).toEqual(['c1', 'c2']);
    expect(channelRows[0]).toMatchObject({ bucketStart, bucketMinutes: 5 });
  });

  it('overwrites a bucket that is sent again instead of duplicating it', async () => {
    const bucketStart = minutesAgo(10);
    const push = (activeChannels: number, faces: number) =>
      upsertSecurityServerUsageStats({
        bucketMinutes: 5,
        buckets: [
          {
            bucketStart,
            server: serverValues({ activeChannels }) as any,
            channels: [channelValues('ext-1', { faces })] as any,
          },
        ],
      });
    await push(2, 80);
    const [original] = await server.find({}).fetchAsync();
    await push(3, 95);
    const serverRows = await server.find({}).fetchAsync();
    const channelRows = await channelStats.find({}).fetchAsync();
    expect(serverRows).toHaveLength(1);
    expect(serverRows[0]._id).toBe(original._id);
    expect(serverRows[0].activeChannels).toBe(3);
    expect(channelRows).toHaveLength(1);
    expect(channelRows[0].faces).toBe(95);
  });

  it('skips channels the ERP does not know yet without failing the batch', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart: minutesAgo(10),
          server: serverValues() as any,
          channels: [channelValues('ext-1'), channelValues('unknown')] as any,
        },
      ],
    });
    expect((await channelStats.find({}).fetchAsync()).map((r: any) => r.channelId)).toEqual(['c1']);
    expect(await server.find({}).countAsync()).toBe(1);
  });

  it('handles buckets without server stats and an empty push', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [{ bucketStart: minutesAgo(10), server: null, channels: [channelValues('ext-1')] as any }],
    });
    expect(await server.find({}).countAsync()).toBe(0);
    expect(await channelStats.find({}).countAsync()).toBe(1);

    await expect(upsertSecurityServerUsageStats({ bucketMinutes: 5, buckets: [] })).resolves.toBeUndefined();
  });

  it('stores separate rows for separate buckets of one channel', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        { bucketStart: minutesAgo(10), server: null, channels: [channelValues('ext-1')] as any },
        { bucketStart: minutesAgo(5), server: null, channels: [channelValues('ext-1')] as any },
      ],
    });
    expect(await channelStats.find({}).countAsync()).toBe(2);
  });
});

describe('getSecurityServerUsageSummary', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(NOW);
  });

  it('is empty before any data arrives', async () => {
    expect(await getSecurityServerUsageSummary(60)).toEqual({
      minutes: 60,
      coveredSeconds: 0,
      lastBucketAt: null,
      server: null,
      channels: [],
    });
  });

  it('ignores buckets older than the range', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [{ bucketStart: minutesAgo(120), server: serverValues() as any, channels: [channelValues('ext-1')] as any }],
    });
    const summary = await getSecurityServerUsageSummary(60);
    expect(summary.server).toBeNull();
    expect(summary.channels).toEqual([]);
    // The freshness time still reflects the newest bucket received.
    expect(summary.lastBucketAt).toEqual(minutesAgo(120));
  });

  it('weights server averages by window count and takes the maximum of the maxima', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart: minutesAgo(20),
          server: serverValues({
            windowCount: 1,
            coveredSeconds: 60,
            inferenceBusyAvgPct: 10,
            inferenceBusyMaxPct: 90,
            gpuUtilAvgPct: 20,
            gpuUtilMaxPct: 95,
            cpuAvgPct: 50,
            eventLoopLagP95Ms: 4,
            eventLoopLagMaxMs: 99,
          }) as any,
          channels: [],
        },
        {
          bucketStart: minutesAgo(10),
          server: serverValues({
            windowCount: 3,
            coveredSeconds: 180,
            inferenceBusyAvgPct: 30,
            inferenceBusyMaxPct: 60,
            gpuUtilAvgPct: 60,
            gpuUtilMaxPct: 70,
            cpuAvgPct: 150,
            eventLoopLagP95Ms: 8,
            eventLoopLagMaxMs: 20,
            activeChannels: 4,
          }) as any,
          channels: [],
        },
      ],
    });
    const { server: summary, coveredSeconds, lastBucketAt } = await getSecurityServerUsageSummary(60);
    expect(coveredSeconds).toBe(240);
    expect(lastBucketAt).toEqual(minutesAgo(10));
    expect(summary).toMatchObject({
      windowCount: 4,
      activeChannels: 4,
      inferenceBusyAvgPct: 25,
      inferenceBusyMaxPct: 90,
      gpuUtilAvgPct: 50,
      gpuUtilMaxPct: 95,
      cpuAvgPct: 125,
      eventLoopLagP95Ms: 7,
      eventLoopLagMaxMs: 99,
    });
  });

  it('reports null GPU figures when no bucket has a GPU', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart: minutesAgo(10),
          server: serverValues({ gpuUtilAvgPct: null, gpuUtilMaxPct: null, gpuMemUsedMb: null }) as any,
          channels: [],
        },
      ],
    });
    expect((await getSecurityServerUsageSummary(60)).server).toMatchObject({
      gpuUtilAvgPct: null,
      gpuUtilMaxPct: null,
      gpuMemUsedMb: null,
    });
  });

  it('derives per-channel rates and percentages from the summed counters', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart: minutesAgo(20),
          server: serverValues({ coveredSeconds: 100 }) as any,
          channels: [channelValues('ext-1', { framesRead: 1000, framesProcessed: 300, skippedBusy: 100, faces: 10, skippedFaceSize: 5, skippedFaceQuality: 5, inferenceMs: 20_000 })] as any,
        },
        {
          bucketStart: minutesAgo(10),
          server: serverValues({ coveredSeconds: 100 }) as any,
          channels: [channelValues('ext-1', { framesRead: 1000, framesProcessed: 300, skippedBusy: 100, faces: 10, skippedFaceSize: 5, skippedFaceQuality: 5, inferenceMs: 20_000, readFailures: 1, reconnects: 2, frameWidth: 1280 })] as any,
        },
      ],
    });
    const { channels } = await getSecurityServerUsageSummary(60);
    expect(channels).toEqual([
      {
        channelId: 'c1',
        name: 'Gate',
        recognitionFps: 5,
        frameWidth: 1920,
        frameHeight: 1080,
        readFps: 10,
        processedFps: 3,
        // 200 dropped of 800 due.
        busySkipPct: 25,
        // 40s of inference over 200s covered.
        inferenceSharePct: 20,
        faces: 20,
        skippedFaceSize: 10,
        skippedFaceQuality: 10,
        // 20 skipped of 40 seen.
        faceSkipPct: 50,
        readFailures: 2,
        reconnects: 4,
      },
    ]);
  });

  it('avoids dividing by zero when nothing was covered or processed', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [
        {
          bucketStart: minutesAgo(10),
          server: serverValues({ coveredSeconds: 0 }) as any,
          channels: [
            channelValues('ext-1', { framesProcessed: 0, skippedBusy: 0, faces: 0, skippedFaceSize: 0, skippedFaceQuality: 0 }),
          ] as any,
        },
      ],
    });
    const [channel] = (await getSecurityServerUsageSummary(60)).channels;
    expect(channel).toMatchObject({
      readFps: 0,
      processedFps: 0,
      busySkipPct: 0,
      inferenceSharePct: 0,
      faceSkipPct: 0,
    });
  });

  it('leaves out channels that no longer exist', async () => {
    await upsertSecurityServerUsageStats({
      bucketMinutes: 5,
      buckets: [{ bucketStart: minutesAgo(10), server: null, channels: [channelValues('ext-1'), channelValues('ext-2')] as any }],
    });
    await SecurityServerChannels.removeAsync('c2');
    expect((await getSecurityServerUsageSummary(60)).channels.map(c => c.channelId)).toEqual(['c1']);
  });
});
