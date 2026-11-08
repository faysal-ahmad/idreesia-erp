import { getFileUrl } from 'meteor/idreesia-common/server/file-storage';
import { getSecurityServerAlerts } from 'meteor/idreesia-common/server/graphql-api/security/security-server-alert/queries';

import type { CommitteeFeatureHandler } from './types';

// The report only reads the alerts the security server pushes to the ERP, so
// there is nothing to set up outside the ERP when it is turned on or off.
export const monitoringAlertsHandler: CommitteeFeatureHandler = {
  enable: () => Promise.resolve(),
  disable: () => Promise.resolve(),
};

export interface WorkspaceMonitoringAlertsFilter {
  // DD-MM-YYYY (Formats.DATE_FORMAT). Alerts raised on this day are returned.
  date: string;
  // Alerts of test profiles; included unless false.
  includeTest?: boolean | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

interface AlertRow {
  _id: string;
  timestamp?: Date;
  profileName?: string;
  profileIsTest?: boolean;
  channelName?: string;
  similarityScore?: number;
  review?: string;
  imageKey?: string;
  thumbnailKey?: string;
}

/**
 * One day's security server alerts, newest first, for committees with the
 * Monitoring Alerts feature. Test profiles' alerts are included unless
 * `includeTest` is false. Only what the report shows is returned: no face
 * quality details or reviewer.
 */
export const getWorkspaceMonitoringAlerts = async ({
  date,
  includeTest,
  pageIndex,
  pageSize,
}: WorkspaceMonitoringAlertsFilter) => {
  const { data, totalResults } = (await getSecurityServerAlerts({
    startDate: date,
    endDate: date,
    includeTest: includeTest === false ? 'false' : 'true',
    pageIndex,
    pageSize,
  })) as unknown as { data: AlertRow[]; totalResults: number };

  const rows = await Promise.all(
    data.map(async alert => ({
      _id: alert._id,
      timestamp: alert.timestamp,
      profileName: alert.profileName,
      profileIsTest: !!alert.profileIsTest,
      channelName: alert.channelName,
      similarityScore: alert.similarityScore,
      review: alert.review,
      imageUrl: alert.imageKey ? await getFileUrl(alert.imageKey) : null,
      thumbnailUrl: alert.thumbnailKey
        ? await getFileUrl(alert.thumbnailKey)
        : null,
    }))
  );

  return { data: rows, totalResults };
};
