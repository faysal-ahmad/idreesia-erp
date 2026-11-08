/**
 * The meetings UI is reusable: it knows nothing about committees or any
 * other host. Each place that shows meetings supplies a data provider
 * implementing `MeetingsDataProvider`.
 *
 * Timestamps are milliseconds since the epoch, as strings. Participant,
 * presenter and assignee ids are whatever the host uses for its members.
 */

export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled';
export type ParticipantRole = 'organizer' | 'required' | 'optional';
export type RsvpStatus = 'pending' | 'accepted' | 'declined' | 'tentative';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type ActionItemStatus = 'open' | 'in-progress' | 'done' | 'cancelled';
/** Which meetings a list shows. */
export type MeetingsView = 'upcoming' | 'past' | 'cancelled' | 'all';

export interface MeetingsInfo {
  /** The current user can schedule and manage meetings. */
  canManage: boolean;
  /** The current user's participant id, if they can be invited. */
  myParticipantId: string | null;
  /** Largest attachment, in bytes, that can be uploaded. */
  maxFileSize: number;
}

/** Someone who can be invited. */
export interface MeetingMember {
  participantId: string;
  name: string | null;
  isCoordinator: boolean;
}

export interface MeetingParticipant {
  participantId: string;
  name: string | null;
  role: ParticipantRole;
  rsvpStatus: RsvpStatus;
  rsvpRespondedAt: string | null;
  rsvpComment: string | null;
  attendanceStatus: AttendanceStatus | null;
  attendanceNote: string | null;
  attendanceMarkedAt: string | null;
  attendanceMarkedByName: string | null;
  /** The current user. */
  isMe: boolean;
}

export interface MeetingAgendaItem {
  _id: string;
  title: string;
  description: string | null;
  durationMinutes: number | null;
  presenterId: string | null;
  presenterName: string | null;
}

export interface Meeting {
  _id: string;
  title: string;
  description: string | null;
  location: string | null;
  onlineUrl: string | null;
  startsAt: string;
  endsAt: string;
  status: MeetingStatus;
  cancelledAt: string | null;
  cancelledByName: string | null;
  cancellationReason: string | null;
  completedAt: string | null;
  completedByName: string | null;
  participants: MeetingParticipant[];
  agenda: MeetingAgendaItem[];
  minutes: string | null;
  minutesUpdatedAt: string | null;
  minutesUpdatedByName: string | null;
  attachmentCount: number;
  openActionItemCount: number;
  /** The current user's response, if they are invited. */
  myRsvpStatus: RsvpStatus | null;
  createdAt: string | null;
  createdByName: string | null;
  updatedAt: string | null;
  updatedByName: string | null;
}

export interface MeetingPage {
  meetings: Meeting[];
  totalResults: number;
}

export interface MeetingsQuery {
  view: MeetingsView;
  /** Meetings that end after this time. */
  from?: string;
  /** Meetings that start before this time. */
  to?: string;
  text?: string;
  pageIndex: number;
  pageSize: number;
}

export interface MeetingAttachment {
  _id: string;
  name: string;
  description: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string | null;
  createdByName: string | null;
  /** The current user can delete it. */
  canDelete: boolean;
}

export interface MeetingActionItem {
  _id: string;
  meetingId: string;
  meetingTitle: string | null;
  agendaItemId: string | null;
  title: string;
  description: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  dueDate: string | null;
  status: ActionItemStatus;
  completedAt: string | null;
  completedByName: string | null;
  createdAt: string | null;
  createdByName: string | null;
  /** The current user can change its status. */
  canChangeStatus: boolean;
}

export interface ActionItemPage {
  items: MeetingActionItem[];
  totalResults: number;
}

export interface ActionItemsQuery {
  meetingId?: string;
  /** 'me' for the current user's own items. */
  assigneeId?: string;
  status?: ActionItemStatus[];
  pageIndex: number;
  pageSize: number;
}

export interface MeetingActivity {
  _id: string;
  /** e.g. 'meeting-created'; see describeActivity. */
  action: string;
  userName: string | null;
  at: string | null;
  details: Record<string, unknown>;
}

export interface MeetingDetails {
  title: string;
  startsAt: string;
  endsAt: string;
  location: string | null;
  onlineUrl: string | null;
  description: string | null;
}

export interface AgendaItemInput {
  title: string;
  description: string | null;
  durationMinutes: number | null;
  presenterId: string | null;
}

export interface AttendanceEntry {
  participantId: string;
  /** null clears it. */
  status: AttendanceStatus | null;
  note: string | null;
}

export interface ActionItemInput {
  title: string;
  description: string | null;
  assigneeId: string | null;
  dueDate: string | null;
  agendaItemId: string | null;
}

/** An error from a provider action; `code` is the server's error code. */
export class MeetingsError extends Error {
  constructor(
    message: string,
    readonly code: string | null = null
  ) {
    super(message);
    this.name = 'MeetingsError';
  }
}

/**
 * Every action rejects with a `MeetingsError` whose message is shown to the
 * user. Changes to a meeting resolve with the updated meeting.
 */
export interface MeetingsDataProvider {
  getInfo(): Promise<MeetingsInfo>;
  /** Everyone who can be invited. */
  loadMembers(): Promise<MeetingMember[]>;

  loadMeetings(query: MeetingsQuery): Promise<MeetingPage>;
  loadMeeting(meetingId: string): Promise<Meeting | null>;

  createMeeting(
    details: MeetingDetails,
    participantIds: string[]
  ): Promise<Meeting>;
  updateMeeting(meetingId: string, details: MeetingDetails): Promise<Meeting>;
  cancelMeeting(meetingId: string, reason?: string): Promise<Meeting>;
  completeMeeting(meetingId: string): Promise<Meeting>;
  reopenMeeting(meetingId: string): Promise<Meeting>;
  deleteMeeting(meetingId: string): Promise<void>;

  /** Makes the participant list exactly these members. */
  setParticipants(meetingId: string, participantIds: string[]): Promise<Meeting>;
  setParticipantRole(
    meetingId: string,
    participantId: string,
    role: ParticipantRole
  ): Promise<Meeting>;
  /** For the current user, or (managers) for `participantId`. */
  respond(
    meetingId: string,
    status: RsvpStatus,
    comment?: string,
    participantId?: string
  ): Promise<Meeting>;
  markAttendance(
    meetingId: string,
    entries: AttendanceEntry[]
  ): Promise<Meeting>;

  addAgendaItem(meetingId: string, input: AgendaItemInput): Promise<Meeting>;
  updateAgendaItem(
    meetingId: string,
    agendaItemId: string,
    input: AgendaItemInput
  ): Promise<Meeting>;
  removeAgendaItem(meetingId: string, agendaItemId: string): Promise<Meeting>;
  reorderAgenda(meetingId: string, agendaItemIds: string[]): Promise<Meeting>;

  setMinutes(meetingId: string, text: string | null): Promise<Meeting>;

  loadAttachments(meetingId: string): Promise<MeetingAttachment[]>;
  /** Uploads a file, reporting progress as a fraction (0-1). */
  uploadAttachment(
    meetingId: string,
    file: File,
    onProgress?: (fraction: number) => void
  ): Promise<void>;
  /** A short-lived link to the file. */
  getAttachmentUrl(attachmentId: string, inline?: boolean): Promise<string>;
  deleteAttachment(attachmentId: string): Promise<void>;

  loadActionItems(query: ActionItemsQuery): Promise<ActionItemPage>;
  createActionItem(
    meetingId: string,
    input: ActionItemInput
  ): Promise<MeetingActionItem>;
  updateActionItem(
    actionItemId: string,
    input: ActionItemInput
  ): Promise<MeetingActionItem>;
  setActionItemStatus(
    actionItemId: string,
    status: ActionItemStatus
  ): Promise<MeetingActionItem>;
  deleteActionItem(actionItemId: string): Promise<void>;

  /** Newest first; pass the last entry's `at` as `before` for more. */
  loadActivity(meetingId: string, before?: string): Promise<MeetingActivity[]>;
}
