import { ModulePaths } from 'meteor/idreesia-common/constants';

// Same URLs as the web's Workspaces module (submodule-paths.ts there).
const committee = (committeeId: string) => `${ModulePaths.workspaces}/committees/${committeeId}`;

/** The screens under one poll. */
export type PollPart = 'edit' | 'results' | 'voters' | 'activity';

/** The screens under one meeting. */
export type MeetingPart =
  | 'edit'
  | 'agenda'
  | 'participants'
  | 'minutes'
  | 'attachments'
  | 'action-items'
  | 'activity';

/** The screens under one document. */
export type DocumentPart = 'versions' | 'activity';

export const WorkspacesPaths = {
  /** Every workspace screen is under this path. */
  root: ModulePaths.workspaces,
  /** Route pattern for a committee's members screen. */
  committeeMembersPattern: `${committee(':committeeId')}/members`,
  committeeMembers: (committeeId: string) => `${committee(committeeId)}/members`,
  /** Route pattern for a committee's discussion; its screens are under it. */
  committeeDiscussionsPattern: `${committee(':committeeId')}/discussions`,
  committeeDiscussions: (committeeId: string) => `${committee(committeeId)}/discussions`,
  committeeDiscussionThreadPattern: `${committee(':committeeId')}/discussions/threads/:threadId`,
  committeeDiscussionThread: (committeeId: string, threadId: string) =>
    `${committee(committeeId)}/discussions/threads/${threadId}`,
  committeeDiscussionSearchPattern: `${committee(':committeeId')}/discussions/search`,
  committeeDiscussionSearch: (committeeId: string) => `${committee(committeeId)}/discussions/search`,
  committeeDiscussionPinnedPattern: `${committee(':committeeId')}/discussions/pinned`,
  committeeDiscussionPinned: (committeeId: string) => `${committee(committeeId)}/discussions/pinned`,
  committeeDiscussionStarredPattern: `${committee(':committeeId')}/discussions/starred`,
  committeeDiscussionStarred: (committeeId: string) => `${committee(committeeId)}/discussions/starred`,
  /** Route pattern for a committee's meetings; their screens are under it. */
  committeeMeetingsPattern: `${committee(':committeeId')}/meetings`,
  committeeMeetings: (committeeId: string) => `${committee(committeeId)}/meetings`,
  committeeNewMeetingPattern: `${committee(':committeeId')}/meetings/new`,
  committeeNewMeeting: (committeeId: string) => `${committee(committeeId)}/meetings/new`,
  /** One meeting, and the screens for its parts under it. */
  committeeMeetingPattern: `${committee(':committeeId')}/meetings/:meetingId`,
  committeeMeeting: (committeeId: string, meetingId: string) =>
    `${committee(committeeId)}/meetings/${meetingId}`,
  /** `part`: edit, agenda, participants, minutes, attachments, action-items or activity. */
  committeeMeetingPartPattern: (part: MeetingPart) =>
    `${committee(':committeeId')}/meetings/:meetingId/${part}`,
  committeeMeetingPart: (committeeId: string, meetingId: string, part: MeetingPart) =>
    `${committee(committeeId)}/meetings/${meetingId}/${part}`,
  /** Route pattern for a committee's polls; their screens are under it. */
  committeePollsPattern: `${committee(':committeeId')}/polls`,
  committeePolls: (committeeId: string) => `${committee(committeeId)}/polls`,
  committeeNewPollPattern: `${committee(':committeeId')}/polls/new`,
  committeeNewPoll: (committeeId: string) => `${committee(committeeId)}/polls/new`,
  /** One poll (its questions and voting), and the screens for its parts under it. */
  committeePollPattern: `${committee(':committeeId')}/polls/:pollId`,
  committeePoll: (committeeId: string, pollId: string) => `${committee(committeeId)}/polls/${pollId}`,
  /** `part`: edit, results, voters or activity. */
  committeePollPartPattern: (part: PollPart) => `${committee(':committeeId')}/polls/:pollId/${part}`,
  committeePollPart: (committeeId: string, pollId: string, part: PollPart) =>
    `${committee(committeeId)}/polls/${pollId}/${part}`,
  /** Route pattern for a committee's documents (the top-level folder); their screens are under it. */
  committeeDocumentsPattern: `${committee(':committeeId')}/documents`,
  committeeDocuments: (committeeId: string) => `${committee(committeeId)}/documents`,
  /** One folder of the documents. */
  committeeDocumentFolderPattern: `${committee(':committeeId')}/documents/folders/:folderId`,
  committeeDocumentFolder: (committeeId: string, folderId: string | null | undefined) =>
    folderId
      ? `${committee(committeeId)}/documents/folders/${folderId}`
      : `${committee(committeeId)}/documents`,
  committeeDocumentTrashPattern: `${committee(':committeeId')}/documents/trash`,
  committeeDocumentTrash: (committeeId: string) => `${committee(committeeId)}/documents/trash`,
  /** One document, and the screens for its parts under it. */
  committeeDocumentPattern: `${committee(':committeeId')}/documents/files/:documentId`,
  committeeDocument: (committeeId: string, documentId: string) =>
    `${committee(committeeId)}/documents/files/${documentId}`,
  /** `part`: versions or activity. */
  committeeDocumentPartPattern: (part: DocumentPart) =>
    `${committee(':committeeId')}/documents/files/:documentId/${part}`,
  committeeDocumentPart: (committeeId: string, documentId: string, part: DocumentPart) =>
    `${committee(committeeId)}/documents/files/${documentId}/${part}`,
  /** Route pattern for a committee's Night Stay Report. */
  committeeNightStayReportPattern: `${committee(':committeeId')}/night-stay-report`,
  committeeNightStayReport: (committeeId: string) => `${committee(committeeId)}/night-stay-report`,
  /** Route pattern for one stay opened from the Night Stay Report. */
  committeeNightStayPattern: `${committee(':committeeId')}/night-stay-report/:stayId`,
  committeeNightStay: (committeeId: string, stayId: string) =>
    `${committee(committeeId)}/night-stay-report/${stayId}`,
  /** Route pattern for a committee's Monitoring Alerts. */
  committeeMonitoringAlertsPattern: `${committee(':committeeId')}/monitoring-alerts`,
  committeeMonitoringAlerts: (committeeId: string) =>
    `${committee(committeeId)}/monitoring-alerts`,
  /** Route pattern for a committee's Monitoring Profiles. */
  committeeMonitoringProfilesPattern: `${committee(':committeeId')}/monitoring-profiles`,
  committeeMonitoringProfiles: (committeeId: string) =>
    `${committee(committeeId)}/monitoring-profiles`,
  /** Route pattern for one profile, under the profiles list. */
  committeeMonitoringProfilePattern: `${committee(':committeeId')}/monitoring-profiles/:profileId`,
  committeeMonitoringProfile: (committeeId: string, profileId: string) =>
    `${committee(committeeId)}/monitoring-profiles/${profileId}`,
};
