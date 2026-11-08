export const CommitteeFeatureKeys = {
  MEMBERS: 'members',
  DISCUSSIONS: 'discussions',
  NIGHT_STAY_REPORT: 'night-stay-report',
  MONITORING_ALERTS: 'monitoring-alerts',
  MONITORING_PROFILES: 'monitoring-profiles',
} as const;

export type CommitteeFeatureKey =
  (typeof CommitteeFeatureKeys)[keyof typeof CommitteeFeatureKeys];

// Categories used to group features on the committee edit page. Features are
// listed in the order of this object, then in their order within
// CommitteeFeatures.
export const CommitteeFeatureCategories = {
  GENERAL: 'General',
  COMMUNICATION: 'Communication',
  SECURITY: 'Security',
} as const;

export type CommitteeFeatureCategory =
  (typeof CommitteeFeatureCategories)[keyof typeof CommitteeFeatureCategories];

export interface CommitteeFeature {
  key: CommitteeFeatureKey;
  name: string;
  description: string;
  category: CommitteeFeatureCategory;
}

// The features that can be enabled per committee. This list is fixed at build
// time; add new entries here to make them available on the committee edit page.
export const CommitteeFeatures: CommitteeFeature[] = [
  {
    key: CommitteeFeatureKeys.MEMBERS,
    name: 'Members',
    category: CommitteeFeatureCategories.GENERAL,
    description:
      'The committee members list; coordinators can also add and remove members.',
  },
  {
    key: CommitteeFeatureKeys.DISCUSSIONS,
    name: 'Discussions',
    category: CommitteeFeatureCategories.COMMUNICATION,
    description: 'A private discussion space for the committee members.',
  },
  {
    key: CommitteeFeatureKeys.NIGHT_STAY_REPORT,
    name: 'Night Stay Report',
    category: CommitteeFeatureCategories.SECURITY,
    description: 'The visitors registered by Security as staying on a given night.',
  },
  {
    key: CommitteeFeatureKeys.MONITORING_ALERTS,
    name: 'Monitoring Alerts',
    category: CommitteeFeatureCategories.SECURITY,
    description: 'Face-match alerts raised on a given day.',
  },
  {
    key: CommitteeFeatureKeys.MONITORING_PROFILES,
    name: 'Monitoring Profiles',
    category: CommitteeFeatureCategories.SECURITY,
    description: 'View and edit the people being watched for, and their photos.',
  },
];

export const isCommitteeFeatureKey = (key: string): key is CommitteeFeatureKey =>
  CommitteeFeatures.some(feature => feature.key === key);
