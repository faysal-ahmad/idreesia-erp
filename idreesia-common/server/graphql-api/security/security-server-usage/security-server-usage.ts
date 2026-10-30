import gql from 'graphql-tag';

export default gql`
  # Averages and maxima are over the security server's stats windows in the
  # range; "latest" values are from its last window.
  type SecurityServerUsageServerType {
    windowCount: Int
    activeChannels: Int
    dnnTarget: String
    inferenceBusyAvgPct: Float
    inferenceBusyMaxPct: Float
    # Null when no NVIDIA GPU is visible.
    gpuUtilAvgPct: Float
    gpuUtilMaxPct: Float
    gpuMemUsedMb: Float
    gpuMemTotalMb: Float
    # Percent of one core, so 250 = 2.5 cores.
    cpuAvgPct: Float
    cpuCores: Int
    eventLoopLagP95Ms: Float
    eventLoopLagMaxMs: Float
  }

  type SecurityServerUsageChannelType {
    channelId: String
    name: String
    recognitionFps: Float
    frameWidth: Int
    frameHeight: Int
    readFps: Float
    processedFps: Float
    busySkipPct: Float
    inferenceSharePct: Float
    # Faces that passed the size and quality checks and were matched.
    faces: Int
    skippedFaceSize: Int
    skippedFaceQuality: Int
    faceSkipPct: Float
    readFailures: Int
    reconnects: Int
  }

  type SecurityServerUsageSummaryType {
    minutes: Int
    coveredSeconds: Int
    # Start of the newest 5-minute bucket the security server has sent.
    lastBucketAt: String
    server: SecurityServerUsageServerType
    channels: [SecurityServerUsageChannelType]
  }

  extend type Query {
    securityServerUsageStats(minutes: Int!): SecurityServerUsageSummaryType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
  }
`;
