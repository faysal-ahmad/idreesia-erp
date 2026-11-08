import type {
  MeetingActionItemStatusValue,
  MeetingAttachmentStatusValue,
  MeetingAttendanceStatusValue,
  MeetingParticipantRoleValue,
  MeetingRsvpStatusValue,
  MeetingsActionValue,
  MeetingsEntityTypeValue,
  MeetingStatusValue,
} from 'meteor/idreesia-common/constants/meetings';

/** Free-form key/value data callers attach to workspaces and meetings. */
export type MeetingsMetadata = Record<string, unknown>;

interface Timestamps {
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
}

export interface MeetingsWorkspaceSettings {
  /** Largest attachment, in bytes, that can be uploaded to the workspace. */
  maxFileSize?: number;
  /** Exact types (`application/pdf`) or wildcards (`image/*`). */
  allowedMimeTypes?: string[];
}

export interface MeetingsWorkspaceDocument extends Timestamps {
  _id: string;
  name: string;
  description?: string;
  metadata?: MeetingsMetadata;
  settings?: MeetingsWorkspaceSettings;
}

export interface MeetingRsvp {
  status: MeetingRsvpStatusValue;
  respondedAt?: Date;
  comment?: string;
}

export interface MeetingAttendance {
  status: MeetingAttendanceStatusValue;
  note?: string;
  markedAt: Date;
  markedBy: string;
}

export interface MeetingParticipant {
  /** Opaque id chosen by the caller (e.g. a karkun id). */
  participantId: string;
  role: MeetingParticipantRoleValue;
  rsvp: MeetingRsvp;
  attendance?: MeetingAttendance;
}

export interface MeetingAgendaItem {
  _id: string;
  title: string;
  description?: string;
  durationMinutes?: number;
  presenterId?: string;
}

export interface MeetingMinutes {
  text: string;
  updatedAt: Date;
  updatedBy: string;
}

export interface MeetingDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  title: string;
  description?: string;
  location?: string;
  onlineUrl?: string;
  startsAt: Date;
  endsAt: Date;
  timeZone: string;
  status: MeetingStatusValue;
  cancelledAt?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  completedAt?: Date;
  completedBy?: string;
  tags: string[];
  metadata?: MeetingsMetadata;
  participants: MeetingParticipant[];
  agenda: MeetingAgendaItem[];
  minutes?: MeetingMinutes;
  attachmentCount: number;
  openActionItemCount: number;
  revision: number;
}

export interface MeetingAttachmentDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  meetingId: string;
  name: string;
  description?: string;
  fileName: string;
  mimeType: string;
  size: number;
  fileKey: string;
  sha256?: string;
  etag?: string;
  status: MeetingAttachmentStatusValue;
  uploadExpiresAt?: Date;
}

export interface MeetingActionItemDocument extends Timestamps {
  _id: string;
  workspaceId: string;
  meetingId: string;
  agendaItemId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  dueDate?: Date;
  status: MeetingActionItemStatusValue;
  completedAt?: Date;
  completedBy?: string;
}

export interface MeetingsActivityDocument {
  _id: string;
  workspaceId: string;
  meetingId?: string;
  entityType: MeetingsEntityTypeValue;
  entityId: string;
  action: MeetingsActionValue;
  userId: string;
  at: Date;
  details?: Record<string, unknown>;
}
