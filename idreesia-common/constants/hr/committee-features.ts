export const CommitteeFeatureKeys = {
  DISCUSSIONS: 'discussions',
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
];

export const isCommitteeFeatureKey = (key: string): key is CommitteeFeatureKey =>
  CommitteeFeatures.some(feature => feature.key === key);
