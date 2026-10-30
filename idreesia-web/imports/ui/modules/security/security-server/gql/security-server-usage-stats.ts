import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SecurityServerUsageStatsQuery,
  SecurityServerUsageStatsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SECURITY_SERVER_USAGE_STATS: TypedDocumentNode<
  SecurityServerUsageStatsQuery,
  SecurityServerUsageStatsQueryVariables
> = gql`
  query securityServerUsageStats($minutes: Int!) {
    securityServerUsageStats(minutes: $minutes) {
      minutes
      coveredSeconds
      lastBucketAt
      server {
        windowCount
        activeChannels
        dnnTarget
        inferenceBusyAvgPct
        inferenceBusyMaxPct
        gpuUtilAvgPct
        gpuUtilMaxPct
        gpuMemUsedMb
        gpuMemTotalMb
        cpuAvgPct
        cpuCores
        eventLoopLagP95Ms
        eventLoopLagMaxMs
      }
      channels {
        channelId
        name
        recognitionFps
        frameWidth
        frameHeight
        readFps
        processedFps
        busySkipPct
        inferenceSharePct
        faces
        skippedFaceSize
        skippedFaceQuality
        faceSkipPct
        readFailures
        reconnects
      }
    }
  }
`;

export default SECURITY_SERVER_USAGE_STATS;
