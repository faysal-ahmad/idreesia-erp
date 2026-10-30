import { Random } from 'meteor/random';

import {
  SecurityServerChannels,
  SecurityServerUsageChannelStats,
  SecurityServerUsageServerStats,
  type SecurityServerUsageChannelStatsDocument,
  type SecurityServerUsageServerStatsDocument,
} from 'meteor/idreesia-common/server/collections/security';

// How long the rollups are kept; the TTL index in migration 56 must match.
export const USAGE_STATS_RETENTION_DAYS = 30;

const MS_PER_MINUTE = 60 * 1000;

type ServerBucketValues = Omit<
  SecurityServerUsageServerStatsDocument,
  '_id' | 'bucketStart' | 'bucketMinutes'
>;
type ChannelBucketValues = Omit<
  SecurityServerUsageChannelStatsDocument,
  '_id' | 'bucketStart' | 'bucketMinutes' | 'channelId'
> & {
  // The security server's own channel id.
  channelId: string;
};

export interface UsageStatsBucket {
  bucketStart: Date;
  server: ServerBucketValues | null;
  channels: ChannelBucketValues[];
}

export interface UsageStatsPush {
  bucketMinutes: number;
  buckets: UsageStatsBucket[];
}

/**
 * Stores usage stats rollups pushed by the security server. Upserts on the
 * bucket (and channel), so a re-sent bucket overwrites itself. Channel ids are
 * the security server's own, matched through `externalId`; a channel the ERP
 * doesn't know (not synced yet) is skipped rather than failing the batch.
 */
export async function upsertSecurityServerUsageStats({
  bucketMinutes,
  buckets,
}: UsageStatsPush): Promise<void> {
  const externalIds = [
    ...new Set(
      buckets.flatMap(bucket => bucket.channels.map(c => c.channelId))
    ),
  ];
  const channels = await SecurityServerChannels.find(
    { externalId: { $in: externalIds } },
    { fields: { _id: 1, externalId: 1 } }
  ).fetchAsync();
  const channelIds = new Map(channels.map(c => [c.externalId, c._id]));

  const serverOps = buckets.flatMap(({ bucketStart, server }) =>
    server
      ? [
          {
            updateOne: {
              filter: { bucketStart },
              update: {
                $set: { bucketMinutes, ...server },
                $setOnInsert: { _id: Random.id() },
              },
              upsert: true,
            },
          },
        ]
      : []
  );
  const channelOps = buckets.flatMap(({ bucketStart, channels: values }) =>
    values.flatMap(({ channelId: externalId, ...rest }) => {
      const channelId = channelIds.get(externalId);
      if (!channelId) return [];
      return [
        {
          updateOne: {
            filter: { channelId, bucketStart },
            update: {
              $set: { bucketMinutes, ...rest },
              $setOnInsert: { _id: Random.id() },
            },
            upsert: true,
          },
        },
      ];
    })
  );

  await Promise.all([
    serverOps.length
      ? SecurityServerUsageServerStats.rawCollection().bulkWrite(serverOps, {
          ordered: false,
        })
      : null,
    channelOps.length
      ? SecurityServerUsageChannelStats.rawCollection().bulkWrite(channelOps, {
          ordered: false,
        })
      : null,
  ]);
}

// ----------------------------------------------------------------------------
// Usage page summary: the same figures as the security server's own Usage
// page, over the buckets in the range.
// ----------------------------------------------------------------------------

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function percent(part: number, whole: number): number {
  return whole === 0 ? 0 : round((part / whole) * 100);
}

// Averages of bucket averages, weighted by how many windows each covers.
function weightedAverage(
  rows: SecurityServerUsageServerStatsDocument[],
  value: (row: SecurityServerUsageServerStatsDocument) => number | null
): number | null {
  let total = 0;
  let weight = 0;
  rows.forEach(row => {
    const v = value(row);
    if (v === null) return;
    total += v * row.windowCount;
    weight += row.windowCount;
  });
  return weight === 0 ? null : round(total / weight);
}

function maxOf(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length === 0 ? null : Math.max(...present);
}

interface ChannelTotals {
  _id: string;
  frameWidth: number | null;
  frameHeight: number | null;
  framesRead: number;
  framesProcessed: number;
  skippedBusy: number;
  readFailures: number;
  reconnects: number;
  faces: number;
  skippedFaceSize: number;
  skippedFaceQuality: number;
  inferenceMs: number;
}

export async function getSecurityServerUsageSummary(minutes: number) {
  const since = new Date(Date.now() - minutes * MS_PER_MINUTE);
  const [serverRows, channelTotals, lastBucket] = await Promise.all([
    SecurityServerUsageServerStats.find(
      { bucketStart: { $gte: since } },
      { sort: { bucketStart: 1 } }
    ).fetchAsync(),
    SecurityServerUsageChannelStats.rawCollection()
      .aggregate<ChannelTotals>([
        { $match: { bucketStart: { $gte: since } } },
        {
          $group: {
            _id: '$channelId',
            frameWidth: { $max: '$frameWidth' },
            frameHeight: { $max: '$frameHeight' },
            framesRead: { $sum: '$framesRead' },
            framesProcessed: { $sum: '$framesProcessed' },
            skippedBusy: { $sum: '$skippedBusy' },
            readFailures: { $sum: '$readFailures' },
            reconnects: { $sum: '$reconnects' },
            faces: { $sum: '$faces' },
            skippedFaceSize: { $sum: '$skippedFaceSize' },
            skippedFaceQuality: { $sum: '$skippedFaceQuality' },
            inferenceMs: { $sum: '$inferenceMs' },
          },
        },
      ])
      .toArray(),
    SecurityServerUsageServerStats.findOneAsync(
      {},
      { sort: { bucketStart: -1 } }
    ),
  ]);

  const coveredSeconds = serverRows.reduce(
    (sum, row) => sum + row.coveredSeconds,
    0
  );
  const latest = serverRows.at(-1);
  const server = latest
    ? {
        windowCount: serverRows.reduce((sum, row) => sum + row.windowCount, 0),
        activeChannels: latest.activeChannels,
        dnnTarget: latest.dnnTarget,
        inferenceBusyAvgPct: weightedAverage(
          serverRows,
          row => row.inferenceBusyAvgPct
        ),
        inferenceBusyMaxPct: maxOf(serverRows.map(r => r.inferenceBusyMaxPct)),
        gpuUtilAvgPct: weightedAverage(serverRows, row => row.gpuUtilAvgPct),
        gpuUtilMaxPct: maxOf(serverRows.map(r => r.gpuUtilMaxPct)),
        gpuMemUsedMb: latest.gpuMemUsedMb,
        gpuMemTotalMb: latest.gpuMemTotalMb,
        cpuAvgPct: weightedAverage(serverRows, row => row.cpuAvgPct),
        cpuCores: latest.cpuCores,
        eventLoopLagP95Ms: weightedAverage(
          serverRows,
          row => row.eventLoopLagP95Ms
        ),
        eventLoopLagMaxMs: maxOf(serverRows.map(r => r.eventLoopLagMaxMs)),
      }
    : null;

  const channels = await SecurityServerChannels.find(
    { _id: { $in: channelTotals.map(t => t._id) } },
    { fields: { _id: 1, name: 1, recognitionFps: 1 } }
  ).fetchAsync();
  const channelsById = new Map(channels.map(c => [c._id, c]));
  const perSecond = (count: number) =>
    coveredSeconds === 0 ? 0 : round(count / coveredSeconds);

  return {
    minutes,
    coveredSeconds: Math.round(coveredSeconds),
    // Start of the newest bucket received, for showing how fresh the data is.
    lastBucketAt: lastBucket?.bucketStart ?? null,
    server,
    channels: channelTotals.flatMap(totals => {
      const channel = channelsById.get(totals._id);
      if (!channel) return [];
      const {
        framesProcessed,
        skippedBusy,
        inferenceMs,
        faces,
        skippedFaceSize,
        skippedFaceQuality,
      } = totals;
      return [
        {
          channelId: channel._id,
          name: channel.name,
          recognitionFps: channel.recognitionFps,
          frameWidth: totals.frameWidth,
          frameHeight: totals.frameHeight,
          readFps: perSecond(totals.framesRead),
          processedFps: perSecond(framesProcessed),
          // Share of frames due for recognition that were dropped because the
          // previous one was still processing.
          busySkipPct: percent(skippedBusy, framesProcessed + skippedBusy),
          // This channel's slice of the server's inference lane.
          inferenceSharePct: percent(inferenceMs, coveredSeconds * 1000),
          faces,
          skippedFaceSize,
          skippedFaceQuality,
          // Share of detected faces skipped as too small or too poor to match.
          faceSkipPct: percent(
            skippedFaceSize + skippedFaceQuality,
            faces + skippedFaceSize + skippedFaceQuality
          ),
          readFailures: totals.readFailures,
          reconnects: totals.reconnects,
        },
      ];
    }),
  };
}
