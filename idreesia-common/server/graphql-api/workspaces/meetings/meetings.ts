import gql from 'graphql-tag';

// A committee's meetings in the Workspaces module (Meetings feature), backed
// by the meetings module. Participants, presenters and assignees are
// committee members (karkun ids). Timestamps are milliseconds as strings.
export default gql`
  type WorkspaceMeetingsInfoType {
    # The logged-in user is a coordinator: can schedule and manage meetings.
    canManage: Boolean
    # The logged-in user's participant id (karkun id), if any.
    myParticipantId: String
    # Largest attachment, in bytes, that can be uploaded.
    maxFileSize: Float
    # Time zone new meetings are scheduled in.
    timeZone: String
  }

  type WorkspaceMeetingMemberType {
    participantId: String
    name: String
    isCoordinator: Boolean
  }

  type WorkspaceMeetingParticipantType {
    participantId: String
    name: String
    # organizer, required or optional
    role: String
    # pending, accepted, declined or tentative
    rsvpStatus: String
    rsvpRespondedAt: String
    rsvpComment: String
    # present, absent, late or excused; null until recorded
    attendanceStatus: String
    attendanceNote: String
    attendanceMarkedAt: String
    attendanceMarkedByName: String
    # The logged-in user.
    isMe: Boolean
  }

  type WorkspaceMeetingAgendaItemType {
    _id: String
    title: String
    description: String
    durationMinutes: Int
    presenterId: String
    presenterName: String
  }

  type WorkspaceMeetingType {
    _id: String
    title: String
    description: String
    location: String
    onlineUrl: String
    startsAt: String
    endsAt: String
    timeZone: String
    # scheduled, completed or cancelled
    status: String
    cancelledAt: String
    cancelledByName: String
    cancellationReason: String
    completedAt: String
    completedByName: String
    participants: [WorkspaceMeetingParticipantType]
    agenda: [WorkspaceMeetingAgendaItemType]
    minutes: String
    minutesUpdatedAt: String
    minutesUpdatedByName: String
    attachmentCount: Int
    openActionItemCount: Int
    # The logged-in user's response, if they are invited.
    myRsvpStatus: String
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
  }

  type PagedWorkspaceMeetingType {
    data: [WorkspaceMeetingType]
    totalResults: Int
  }

  type WorkspaceMeetingAttachmentType {
    _id: String
    name: String
    description: String
    fileName: String
    mimeType: String
    size: Float
    createdAt: String
    createdByName: String
    # Coordinators and the uploader can delete it.
    canDelete: Boolean
  }

  type WorkspaceMeetingActionItemType {
    _id: String
    meetingId: String
    meetingTitle: String
    agendaItemId: String
    title: String
    description: String
    assigneeId: String
    assigneeName: String
    dueDate: String
    # open, in-progress, done or cancelled
    status: String
    completedAt: String
    completedByName: String
    createdAt: String
    createdByName: String
    # Coordinators and the assignee can change its status.
    canChangeStatus: Boolean
  }

  type PagedWorkspaceMeetingActionItemType {
    data: [WorkspaceMeetingActionItemType]
    totalResults: Int
  }

  type WorkspaceMeetingActivityType {
    _id: String
    # A MeetingsAction, e.g. 'meeting-created'.
    action: String
    entityType: String
    entityId: String
    meetingId: String
    userName: String
    at: String
    # JSON object with action-specific details.
    details: String
  }

  type WorkspaceMeetingUploadType {
    uploadId: String
    # PUT the file here with the Content-Type header below.
    url: String
    contentType: String
    expiresAt: String
  }

  type WorkspaceMeetingDownloadType {
    url: String
    fileName: String
  }

  input WorkspaceMeetingInput {
    title: String!
    startsAt: String!
    endsAt: String!
    location: String
    onlineUrl: String
    description: String
  }

  input WorkspaceMeetingAgendaItemInput {
    title: String!
    description: String
    durationMinutes: Int
    presenterId: String
  }

  input WorkspaceMeetingAttendanceInput {
    participantId: String!
    # null clears it
    status: String
    note: String
  }

  input WorkspaceMeetingActionItemInput {
    title: String!
    description: String
    assigneeId: String
    dueDate: String
    agendaItemId: String
  }

  extend type Query {
    workspaceMeetingsInfo(committeeId: String!): WorkspaceMeetingsInfoType
    # The committee's members, who can be invited.
    workspaceMeetingMembers(
      committeeId: String!
    ): [WorkspaceMeetingMemberType]
    # view: upcoming (default), past, cancelled or all. from/to narrow to
    # meetings overlapping that range (e.g. a calendar month).
    workspaceMeetings(
      committeeId: String!
      view: String
      from: String
      to: String
      text: String
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceMeetingType
    workspaceMeetingById(
      committeeId: String!
      meetingId: String!
    ): WorkspaceMeetingType
    workspaceMeetingAttachments(
      committeeId: String!
      meetingId: String!
    ): [WorkspaceMeetingAttachmentType]
    # assigneeId 'me' for the logged-in user's own items.
    workspaceMeetingActionItems(
      committeeId: String!
      meetingId: String
      assigneeId: String
      status: [String]
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspaceMeetingActionItemType
    # Newest first; pass the last entry's 'at' as 'before' for the next page.
    workspaceMeetingActivity(
      committeeId: String!
      meetingId: String
      before: String
      limit: Int
    ): [WorkspaceMeetingActivityType]
  }

  extend type Mutation {
    # Coordinators only, like every meeting change below unless noted.
    workspaceCreateMeeting(
      committeeId: String!
      input: WorkspaceMeetingInput!
      participantIds: [String]
    ): WorkspaceMeetingType
    workspaceUpdateMeeting(
      committeeId: String!
      meetingId: String!
      input: WorkspaceMeetingInput!
    ): WorkspaceMeetingType
    workspaceCancelMeeting(
      committeeId: String!
      meetingId: String!
      reason: String
    ): WorkspaceMeetingType
    workspaceCompleteMeeting(
      committeeId: String!
      meetingId: String!
    ): WorkspaceMeetingType
    workspaceReopenMeeting(
      committeeId: String!
      meetingId: String!
    ): WorkspaceMeetingType
    workspaceDeleteMeeting(committeeId: String!, meetingId: String!): Boolean

    # Makes the participant list exactly these members (new ones invited,
    # missing ones removed).
    workspaceSetMeetingParticipants(
      committeeId: String!
      meetingId: String!
      participantIds: [String]!
    ): WorkspaceMeetingType
    workspaceSetMeetingParticipantRole(
      committeeId: String!
      meetingId: String!
      participantId: String!
      role: String!
    ): WorkspaceMeetingType
    # Members answer for themselves (participantId omitted); coordinators
    # can answer for any participant.
    workspaceRespondToMeeting(
      committeeId: String!
      meetingId: String!
      participantId: String
      status: String!
      comment: String
    ): WorkspaceMeetingType
    workspaceMarkMeetingAttendance(
      committeeId: String!
      meetingId: String!
      entries: [WorkspaceMeetingAttendanceInput]!
    ): WorkspaceMeetingType

    workspaceAddMeetingAgendaItem(
      committeeId: String!
      meetingId: String!
      input: WorkspaceMeetingAgendaItemInput!
    ): WorkspaceMeetingType
    workspaceUpdateMeetingAgendaItem(
      committeeId: String!
      meetingId: String!
      agendaItemId: String!
      input: WorkspaceMeetingAgendaItemInput!
    ): WorkspaceMeetingType
    workspaceRemoveMeetingAgendaItem(
      committeeId: String!
      meetingId: String!
      agendaItemId: String!
    ): WorkspaceMeetingType
    workspaceReorderMeetingAgenda(
      committeeId: String!
      meetingId: String!
      agendaItemIds: [String]!
    ): WorkspaceMeetingType

    workspaceSetMeetingMinutes(
      committeeId: String!
      meetingId: String!
      text: String
    ): WorkspaceMeetingType

    # Any member. Starts a direct upload: PUT the file to the URL, then call
    # workspaceCompleteMeetingAttachmentUpload.
    workspaceCreateMeetingAttachmentUpload(
      committeeId: String!
      meetingId: String!
      fileName: String!
      mimeType: String
      size: Float!
    ): WorkspaceMeetingUploadType
    workspaceCompleteMeetingAttachmentUpload(
      committeeId: String!
      uploadId: String!
    ): WorkspaceMeetingAttachmentType
    workspaceAbortMeetingAttachmentUpload(
      committeeId: String!
      uploadId: String!
    ): Boolean
    # Any member. A mutation because each download is logged.
    workspaceMeetingAttachmentDownloadUrl(
      committeeId: String!
      attachmentId: String!
      inline: Boolean
    ): WorkspaceMeetingDownloadType
    # Coordinators and the uploader.
    workspaceDeleteMeetingAttachment(
      committeeId: String!
      attachmentId: String!
    ): Boolean

    workspaceCreateMeetingActionItem(
      committeeId: String!
      meetingId: String!
      input: WorkspaceMeetingActionItemInput!
    ): WorkspaceMeetingActionItemType
    workspaceUpdateMeetingActionItem(
      committeeId: String!
      actionItemId: String!
      input: WorkspaceMeetingActionItemInput!
    ): WorkspaceMeetingActionItemType
    # Coordinators and the assignee.
    workspaceSetMeetingActionItemStatus(
      committeeId: String!
      actionItemId: String!
      status: String!
    ): WorkspaceMeetingActionItemType
    workspaceDeleteMeetingActionItem(
      committeeId: String!
      actionItemId: String!
    ): Boolean
  }
`;
