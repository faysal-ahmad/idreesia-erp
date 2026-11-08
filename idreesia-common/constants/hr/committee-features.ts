export const CommitteeFeatureKeys = {
  DISCUSSIONS: 'discussions',
  NIGHT_STAY_REPORT: 'night-stay-report',
  MONITORING_ALERTS: 'monitoring-alerts',
  MONITORING_PROFILES: 'monitoring-profiles',
} as const;

export type CommitteeFeatureKey =
  (typeof CommitteeFeatureKeys)[keyof typeof CommitteeFeatureKeys];

export interface CommitteeFeature {
  key: CommitteeFeatureKey;
  name: string;
  description: string;
}

// The features that can be enabled per committee. This list is fixed at build
// time; add new entries here to make them available on the committee edit page.
export const CommitteeFeatures: CommitteeFeature[] = [
  {
    key: CommitteeFeatureKeys.DISCUSSIONS,
    name: 'Discussions',
    description: 'A private discussion space for the committee members.',
  },
  {
    key: CommitteeFeatureKeys.NIGHT_STAY_REPORT,
    name: 'Night Stay Report',
    description: 'The visitors registered by Security as staying on a given night.',
  },
  {
    key: CommitteeFeatureKeys.MONITORING_ALERTS,
    name: 'Monitoring Alerts',
    description: 'Face-match alerts raised on a given day.',
  },
  {
    key: CommitteeFeatureKeys.MONITORING_PROFILES,
    name: 'Monitoring Profiles',
    description: 'View and edit the people being watched for, and their photos.',
  },
];

export const isCommitteeFeatureKey = (key: string): key is CommitteeFeatureKey =>
  CommitteeFeatures.some(feature => feature.key === key);
