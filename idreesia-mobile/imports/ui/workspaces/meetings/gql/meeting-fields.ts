import gql from 'graphql-tag';

/** Everything the meeting screens show about a meeting. */
export const MOBILE_WORKSPACE_MEETING_FIELDS = gql`
  fragment MobileWorkspaceMeetingFields on WorkspaceMeetingType {
    _id
    title
    description
    location
    onlineUrl
    startsAt
    endsAt
    status
    cancelledAt
    cancelledByName
    cancellationReason
    completedAt
    completedByName
    participants {
      participantId
      name
      role
      rsvpStatus
      rsvpRespondedAt
      rsvpComment
      attendanceStatus
      attendanceNote
      attendanceMarkedAt
      attendanceMarkedByName
      isMe
    }
    agenda {
      _id
      title
      description
      durationMinutes
      presenterId
      presenterName
    }
    minutes
    minutesUpdatedAt
    minutesUpdatedByName
    attachmentCount
    openActionItemCount
    myRsvpStatus
    updatedAt
  }
`;

export const MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS = gql`
  fragment MobileWorkspaceMeetingActionItemFields on WorkspaceMeetingActionItemType {
    _id
    meetingId
    meetingTitle
    meetingEndsAt
    agendaItemId
    title
    description
    assigneeId
    assigneeName
    dueDate
    status
    completedAt
    completedByName
    canChangeStatus
  }
`;
