// The parts of a committee document the feature logic reads.
export interface CommitteeDoc {
  _id: string;
  name: string;
  members?: Array<{ karkunId: string; role?: string }>;
  features?: string[];
  discussionsWorkspaceId?: string;
  dmsWorkspaceId?: string;
  meetingsWorkspaceId?: string;
  pollsWorkspaceId?: string;
  projectsWorkspaceId?: string;
}

/**
 * Turns a committee feature on or off outside the ERP (e.g. in chat).
 * Each returns the extra fields to `$set` on the committee, if any.
 * `userId` is the user turning the feature on or off.
 */
export interface CommitteeFeatureHandler {
  enable(
    committee: CommitteeDoc,
    userId: string
  ): Promise<Record<string, unknown> | void>;
  disable(
    committee: CommitteeDoc,
    userId: string
  ): Promise<Record<string, unknown> | void>;
  /** Called, while the feature is enabled, before a member is added. */
  memberAdded?(committee: CommitteeDoc, karkunId: string): Promise<void>;
  /** Called, while the feature is enabled, before a member is removed. */
  memberRemoved?(committee: CommitteeDoc, karkunId: string): Promise<void>;
}
