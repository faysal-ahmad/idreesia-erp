import { Mongo } from 'meteor/mongo';

// Usage stats pushed by the security server in 5-minute rollups of its
// per-minute windows, for the Usage page. Machine-written through bulk
// upserts on bucketStart (and channelId), so no schema is attached. Expired
// by a TTL index on bucketStart (migration 56).

// Averages are over the bucket's windows (re-averaged weighted by
// windowCount); "latest" values are from its last window.
export interface SecurityServerUsageServerStatsDocument {
  _id: string;
  bucketStart: Date;
  bucketMinutes: number;
  windowCount: number;
  coveredSeconds: number;
  activeChannels: number;
  dnnTarget: string;
  inferenceBusyAvgPct: number;
  inferenceBusyMaxPct: number;
  gpuUtilAvgPct: number | null;
  gpuUtilMaxPct: number | null;
  gpuMemUsedMb: number | null;
  gpuMemTotalMb: number | null;
  // Percent of one core, so 250 = 2.5 cores.
  cpuAvgPct: number;
  cpuCores: number;
  eventLoopLagP95Ms: number;
  eventLoopLagMaxMs: number;
}

// Counts are summed over the bucket's windows. channelId is the ERP's own
// channel _id.
export interface SecurityServerUsageChannelStatsDocument {
  _id: string;
  bucketStart: Date;
  bucketMinutes: number;
  channelId: string;
  frameWidth: number | null;
  frameHeight: number | null;
  framesRead: number;
  framesProcessed: number;
  skippedFps: number;
  skippedBusy: number;
  readFailures: number;
  reconnects: number;
  faces: number;
  skippedFaceSize: number;
  skippedFaceQuality: number;
  inferenceMs: number;
}

export const SecurityServerUsageServerStats = new Mongo.Collection<SecurityServerUsageServerStatsDocument>(
  'security-server-usage-server-stats'
);

export const SecurityServerUsageChannelStats = new Mongo.Collection<SecurityServerUsageChannelStatsDocument>(
  'security-server-usage-channel-stats'
);
