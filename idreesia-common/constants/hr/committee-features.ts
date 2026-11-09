export const CommitteeFeatureKeys = {
  MEMBERS: 'members',
  DISCUSSIONS: 'discussions',
  DOCUMENTS: 'documents',
  MEETINGS: 'meetings',
  POLLS: 'polls',
  PROJECTS: 'projects',
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
    key: CommitteeFeatureKeys.DOCUMENTS,
    name: 'Documents',
    category: CommitteeFeatureCategories.COMMUNICATION,
    description:
      'A shared document library for the committee members, with folders, versions and check-out.',
  },
  {
    key: CommitteeFeatureKeys.MEETINGS,
    name: 'Meetings',
    category: CommitteeFeatureCategories.COMMUNICATION,
    description:
      'Committee meetings with participants, agenda, attendance, minutes, attachments and action items.',
  },
  {
    key: CommitteeFeatureKeys.POLLS,
    name: 'Polls',
    category: CommitteeFeatureCategories.COMMUNICATION,
    description:
      'Polls for the committee members, named or anonymous, with results once the poll closes.',
  },
  {
    key: CommitteeFeatureKeys.PROJECTS,
    name: 'Projects & Tasks',
    category: CommitteeFeatureCategories.GENERAL,
    description:
      'Tasks with assignees, due dates and progress, and projects that group tasks, each with a private chat for its participants.',
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
