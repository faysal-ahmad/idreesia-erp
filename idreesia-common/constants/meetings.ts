/**
 * Constants for the headless meetings module
 * (server/business-logic/meetings).
 */

/** The module's name as a headless module (notifications are keyed by it). */
export const MEETINGS_MODULE = 'meetings';

export const MeetingStatus = {
  SCHEDULED: 'scheduled',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;
export type MeetingStatusValue =
  (typeof MeetingStatus)[keyof typeof MeetingStatus];

export const MeetingParticipantRole = {
  ORGANIZER: 'organizer',
  REQUIRED: 'required',
  OPTIONAL: 'optional',
} as const;
export type MeetingParticipantRoleValue =
  (typeof MeetingParticipantRole)[keyof typeof MeetingParticipantRole];

export const MeetingRsvpStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  TENTATIVE: 'tentative',
} as const;
export type MeetingRsvpStatusValue =
  (typeof MeetingRsvpStatus)[keyof typeof MeetingRsvpStatus];

export const MeetingAttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused',
} as const;
export type MeetingAttendanceStatusValue =
  (typeof MeetingAttendanceStatus)[keyof typeof MeetingAttendanceStatus];

export const MeetingActionItemStatus = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;
export type MeetingActionItemStatusValue =
  (typeof MeetingActionItemStatus)[keyof typeof MeetingActionItemStatus];

/** Action items in these states count as open on their meeting. */
export const OPEN_ACTION_ITEM_STATUSES: MeetingActionItemStatusValue[] = [
  MeetingActionItemStatus.OPEN,
  MeetingActionItemStatus.IN_PROGRESS,
];

export const MeetingAttachmentStatus = {
  /** A direct-to-storage upload that has not been completed yet. */
  PENDING: 'pending',
  READY: 'ready',
} as const;
export type MeetingAttachmentStatusValue =
  (typeof MeetingAttachmentStatus)[keyof typeof MeetingAttachmentStatus];

export const MeetingsEntityType = {
  WORKSPACE: 'workspace',
  MEETING: 'meeting',
  PARTICIPANT: 'participant',
  AGENDA_ITEM: 'agenda-item',
  ATTACHMENT: 'attachment',
  ACTION_ITEM: 'action-item',
} as const;
export type MeetingsEntityTypeValue =
  (typeof MeetingsEntityType)[keyof typeof MeetingsEntityType];

export const MeetingsAction = {
  WORKSPACE_CREATED: 'workspace-created',
  WORKSPACE_UPDATED: 'workspace-updated',
  WORKSPACE_DELETED: 'workspace-deleted',
  WORKSPACE_RESTORED: 'workspace-restored',

  MEETING_CREATED: 'meeting-created',
  MEETING_UPDATED: 'meeting-updated',
  MEETING_RESCHEDULED: 'meeting-rescheduled',
  MEETING_CANCELLED: 'meeting-cancelled',
  MEETING_REOPENED: 'meeting-reopened',
  MEETING_COMPLETED: 'meeting-completed',
  MEETING_DELETED: 'meeting-deleted',

  PARTICIPANTS_ADDED: 'participants-added',
  PARTICIPANT_REMOVED: 'participant-removed',
  PARTICIPANT_ROLE_CHANGED: 'participant-role-changed',
  INVITATION_RESPONDED: 'invitation-responded',
  ATTENDANCE_MARKED: 'attendance-marked',

  AGENDA_ITEM_ADDED: 'agenda-item-added',
  AGENDA_ITEM_UPDATED: 'agenda-item-updated',
  AGENDA_ITEM_REMOVED: 'agenda-item-removed',
  AGENDA_REORDERED: 'agenda-reordered',

  MINUTES_UPDATED: 'minutes-updated',

  ATTACHMENT_ADDED: 'attachment-added',
  ATTACHMENT_UPDATED: 'attachment-updated',
  ATTACHMENT_DELETED: 'attachment-deleted',
  ATTACHMENT_DOWNLOADED: 'attachment-downloaded',

  ACTION_ITEM_CREATED: 'action-item-created',
  ACTION_ITEM_UPDATED: 'action-item-updated',
  ACTION_ITEM_STATUS_CHANGED: 'action-item-status-changed',
  ACTION_ITEM_DELETED: 'action-item-deleted',
} as const;
export type MeetingsActionValue =
  (typeof MeetingsAction)[keyof typeof MeetingsAction];

/** Used when a workspace doesn't set its own settings.maxFileSize. */
export const MEETINGS_DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;
/** How long a presigned direct-upload URL (and its pending upload) lives. */
export const MEETINGS_UPLOAD_URL_EXPIRY_SECONDS = 15 * 60;
/** How long a presigned download URL lives. */
export const MEETINGS_DOWNLOAD_URL_EXPIRY_SECONDS = 15 * 60;
export const MEETINGS_DEFAULT_PAGE_SIZE = 50;
export const MEETINGS_MAX_PAGE_SIZE = 200;
export const MEETINGS_MAX_TITLE_LENGTH = 255;
export const MEETINGS_MAX_PARTICIPANTS = 500;
export const MEETINGS_MAX_AGENDA_ITEMS = 100;
/** Meetings store UTC times; this is the zone they are shown in by default. */
export const MEETINGS_DEFAULT_TIME_ZONE = 'Asia/Karachi';
