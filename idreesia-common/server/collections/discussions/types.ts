export interface DiscussionsWorkspaceDocument {
  _id: string;
  name: string;
  /** Internal: the chat private group behind the workspace. */
  chatGroupId: string;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}
