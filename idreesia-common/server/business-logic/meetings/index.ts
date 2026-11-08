/**
 * Headless meetings module: workspaces of one-off meetings with
 * participants (RSVP and attendance), agenda, minutes, action items and
 * attachments stored in object storage.
 *
 * Callers enforce access - nothing here checks whether a user may see or
 * change a workspace or meeting. Every function takes the acting user's id,
 * which is recorded on changes and in the activity log. Participant,
 * assignee and presenter ids are opaque to the module. The module enforces
 * its own rules: meeting state transitions, unique participants, valid
 * times, upload limits. Errors are GraphQLErrors with an `extensions.code`
 * (see MeetingsErrorCode).
 */
export type { MeetingsErrorCode } from './errors';
export type {
  MeetingsPage,
  MeetingsPageOptions,
  MeetingsSortOrder,
} from './internal';

export { listMeetingsActivity } from './activity';
export type { ListMeetingsActivityOptions } from './activity';

export {
  createMeetingsWorkspace,
  updateMeetingsWorkspace,
  getMeetingsWorkspace,
  listMeetingsWorkspaces,
  deleteMeetingsWorkspace,
  restoreMeetingsWorkspace,
  purgeMeetingsWorkspace,
} from './workspaces';
export type {
  CreateMeetingsWorkspaceInput,
  UpdateMeetingsWorkspaceInput,
  ListMeetingsWorkspacesOptions,
} from './workspaces';

export {
  createMeeting,
  getMeeting,
  updateMeeting,
  listMeetings,
  listParticipantMeetings,
  cancelMeeting,
  completeMeeting,
  reopenMeeting,
  deleteMeeting,
} from './meetings';
export type {
  CreateMeetingInput,
  UpdateMeetingInput,
  ListMeetingsOptions,
  ListParticipantMeetingsOptions,
} from './meetings';

export {
  addParticipants,
  removeParticipant,
  setParticipantRole,
  respondToInvitation,
  markAttendance,
} from './participants';
export type {
  ParticipantInput,
  InvitationResponse,
  AttendanceEntry,
} from './participants';

export {
  addAgendaItem,
  updateAgendaItem,
  removeAgendaItem,
  reorderAgenda,
} from './agenda';
export type { AgendaItemInput, UpdateAgendaItemInput } from './agenda';

export { setMinutes } from './minutes';

export {
  uploadAttachment,
  createAttachmentUploadUrl,
  completeAttachmentUpload,
  abortAttachmentUpload,
  purgeExpiredAttachmentUploads,
  listAttachments,
  getAttachment,
  updateAttachment,
  getAttachmentDownloadUrl,
  readAttachmentContent,
  deleteAttachment,
} from './attachments';
export type {
  UploadAttachmentInput,
  CreateAttachmentUploadInput,
  AttachmentUploadTicket,
  UpdateAttachmentInput,
  AttachmentDownload,
} from './attachments';

export {
  createActionItem,
  getActionItem,
  updateActionItem,
  setActionItemStatus,
  deleteActionItem,
  listActionItems,
} from './action-items';
export type {
  CreateActionItemInput,
  UpdateActionItemInput,
  ListActionItemsOptions,
} from './action-items';
