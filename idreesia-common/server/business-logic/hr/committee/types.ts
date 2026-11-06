// The parts of a committee document the feature logic reads.
export interface CommitteeDoc {
  _id: string;
  name: string;
  members?: Array<{ karkunId: string; isCoordinator?: boolean }>;
  features?: string[];
  chatGroupId?: string;
}

/**
 * Turns a committee feature on or off outside the ERP (e.g. in chat).
 * Each returns the extra fields to `$set` on the committee, if any.
 */
export interface CommitteeFeatureHandler {
  enable(committee: CommitteeDoc): Promise<Record<string, unknown> | void>;
  disable(committee: CommitteeDoc): Promise<Record<string, unknown> | void>;
}
