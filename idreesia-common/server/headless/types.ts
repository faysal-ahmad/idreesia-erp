/** A workspace inside one headless module. `workspaceId` is the module's own id. */
export interface WorkspaceRef {
  module: string;
  workspaceId: string;
}

/**
 * What a module publishes. The ERP stores it (stamping the module name) and
 * owns its lifecycle, including who has read it.
 */
export interface ModuleNotification {
  /**
   * Unique within the module. Publishing the same id again updates the stored
   * notification, so deterministic ids (e.g. `meeting-reminder:<meetingId>:<date>`)
   * keep one notification current instead of piling up new ones.
   */
  id: string;
  workspaceId: string;
  /** What the event is about, e.g. 'document', 'meeting'. Module-defined. */
  entityType: string;
  entityId: string;
  /** Module-defined, e.g. 'document-force-unlocked'. */
  eventType: string;
  /** Human-readable description of the event. */
  eventDetails: string;
  createdAt: Date;
  /** Absent: for everyone in the workspace. */
  recipientUserId?: string;
  /** Who caused the event; they are not notified of their own action. */
  actorUserId?: string;
  /** Optional structured details (e.g. for localisation). */
  data?: Record<string, unknown>;
  /** After this time the notification is no longer shown. */
  expiresAt?: Date;
}

/**
 * What a committee feature that is not a headless module publishes: the same
 * as a module's notification, but addressed to a committee rather than a
 * workspace.
 */
export type CommitteeNotification = Omit<ModuleNotification, 'workspaceId'> & {
  committeeId: string;
};

/**
 * What every headless module implements. A headless module owns its state
 * and its workspaces; the ERP only knows a workspace by the opaque id the
 * module handed out. Domain operations (messages, polls, ...) are NOT part of
 * this contract: each module exposes its own typed API.
 */
export interface HeadlessModule {
  /** Unique module name, e.g. 'discussions'. */
  readonly name: string;

  createWorkspace(input: {
    name: string;
    createdBy: string;
    metadata?: Record<string, unknown>;
  }): Promise<WorkspaceRef>;
  archiveWorkspace(workspace: WorkspaceRef, userId: string): Promise<void>;

  /**
   * Called when an ERP user gains / loses access to a workspace. Idempotent.
   * Modules with nothing to do implement these as no-ops; modules backed by
   * a chat group use them to keep its membership in step.
   */
  addUser(workspace: WorkspaceRef, userId: string): Promise<void>;
  removeUser(workspace: WorkspaceRef, userId: string): Promise<void>;
}

/**
 * How a module publishes notifications: on a user action, or from its own
 * scheduled job. Modules get one from `createNotifier(moduleName)` and never
 * touch the notifications collection directly.
 */
export interface Notifier {
  /**
   * Stores the notification. Publishing an id again updates it: unchanged
   * content is ignored (so a read notification stays read), changed content
   * replaces it and makes it unread again.
   */
  publish(notification: ModuleNotification): Promise<void>;
  /** Removes a notification that no longer applies. */
  retire(id: string): Promise<void>;
}

/** How a committee feature that is not a headless module publishes. */
export interface CommitteeNotifier {
  /** Same semantics as `Notifier.publish`. */
  publish(notification: CommitteeNotification): Promise<void>;
  retire(id: string): Promise<void>;
}
