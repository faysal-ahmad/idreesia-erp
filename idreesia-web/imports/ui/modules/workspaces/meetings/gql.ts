import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceAbortMeetingAttachmentUploadMutation,
  WorkspaceAbortMeetingAttachmentUploadMutationVariables,
  WorkspaceAddMeetingAgendaItemMutation,
  WorkspaceAddMeetingAgendaItemMutationVariables,
  WorkspaceCancelMeetingMutation,
  WorkspaceCancelMeetingMutationVariables,
  WorkspaceCompleteMeetingAttachmentUploadMutation,
  WorkspaceCompleteMeetingAttachmentUploadMutationVariables,
  WorkspaceCompleteMeetingMutation,
  WorkspaceCompleteMeetingMutationVariables,
  WorkspaceCreateMeetingActionItemMutation,
  WorkspaceCreateMeetingActionItemMutationVariables,
  WorkspaceCreateMeetingAttachmentUploadMutation,
  WorkspaceCreateMeetingAttachmentUploadMutationVariables,
  WorkspaceCreateMeetingMutation,
  WorkspaceCreateMeetingMutationVariables,
  WorkspaceDeleteMeetingActionItemMutation,
  WorkspaceDeleteMeetingActionItemMutationVariables,
  WorkspaceDeleteMeetingAttachmentMutation,
  WorkspaceDeleteMeetingAttachmentMutationVariables,
  WorkspaceDeleteMeetingMutation,
  WorkspaceDeleteMeetingMutationVariables,
  WorkspaceMarkMeetingAttendanceMutation,
  WorkspaceMarkMeetingAttendanceMutationVariables,
  WorkspaceMeetingActionItemsQuery,
  WorkspaceMeetingActionItemsQueryVariables,
  WorkspaceMeetingActivityQuery,
  WorkspaceMeetingActivityQueryVariables,
  WorkspaceMeetingAttachmentDownloadUrlMutation,
  WorkspaceMeetingAttachmentDownloadUrlMutationVariables,
  WorkspaceMeetingAttachmentsQuery,
  WorkspaceMeetingAttachmentsQueryVariables,
  WorkspaceMeetingByIdQuery,
  WorkspaceMeetingByIdQueryVariables,
  WorkspaceMeetingMembersQuery,
  WorkspaceMeetingMembersQueryVariables,
  WorkspaceMeetingsInfoQuery,
  WorkspaceMeetingsInfoQueryVariables,
  WorkspaceMeetingsQuery,
  WorkspaceMeetingsQueryVariables,
  WorkspaceRemoveMeetingAgendaItemMutation,
  WorkspaceRemoveMeetingAgendaItemMutationVariables,
  WorkspaceReopenMeetingMutation,
  WorkspaceReopenMeetingMutationVariables,
  WorkspaceReorderMeetingAgendaMutation,
  WorkspaceReorderMeetingAgendaMutationVariables,
  WorkspaceRespondToMeetingMutation,
  WorkspaceRespondToMeetingMutationVariables,
  WorkspaceSetMeetingActionItemStatusMutation,
  WorkspaceSetMeetingActionItemStatusMutationVariables,
  WorkspaceSetMeetingMinutesMutation,
  WorkspaceSetMeetingMinutesMutationVariables,
  WorkspaceSetMeetingParticipantRoleMutation,
  WorkspaceSetMeetingParticipantRoleMutationVariables,
  WorkspaceSetMeetingParticipantsMutation,
  WorkspaceSetMeetingParticipantsMutationVariables,
  WorkspaceUpdateMeetingActionItemMutation,
  WorkspaceUpdateMeetingActionItemMutationVariables,
  WorkspaceUpdateMeetingAgendaItemMutation,
  WorkspaceUpdateMeetingAgendaItemMutationVariables,
  WorkspaceUpdateMeetingMutation,
  WorkspaceUpdateMeetingMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const MEETING_FIELDS = gql`
  fragment WorkspaceMeetingFields on WorkspaceMeetingType {
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
    createdAt
    createdByName
    updatedAt
    updatedByName
  }
`;

const ATTACHMENT_FIELDS = gql`
  fragment WorkspaceMeetingAttachmentFields on WorkspaceMeetingAttachmentType {
    _id
    name
    description
    fileName
    mimeType
    size
    createdAt
    createdByName
    canDelete
  }
`;

const ACTION_ITEM_FIELDS = gql`
  fragment WorkspaceMeetingActionItemFields on WorkspaceMeetingActionItemType {
    _id
    meetingId
    meetingTitle
    agendaItemId
    title
    description
    assigneeId
    assigneeName
    dueDate
    status
    completedAt
    completedByName
    createdAt
    createdByName
    canChangeStatus
  }
`;

export const WORKSPACE_MEETINGS_INFO: TypedDocumentNode<
  WorkspaceMeetingsInfoQuery,
  WorkspaceMeetingsInfoQueryVariables
> = gql`
  query workspaceMeetingsInfo($committeeId: String!) {
    workspaceMeetingsInfo(committeeId: $committeeId) {
      canManage
      myParticipantId
      maxFileSize
      timeZone
    }
  }
`;

export const WORKSPACE_MEETING_MEMBERS: TypedDocumentNode<
  WorkspaceMeetingMembersQuery,
  WorkspaceMeetingMembersQueryVariables
> = gql`
  query workspaceMeetingMembers($committeeId: String!) {
    workspaceMeetingMembers(committeeId: $committeeId) {
      participantId
      name
      isCoordinator
    }
  }
`;

export const WORKSPACE_MEETINGS: TypedDocumentNode<
  WorkspaceMeetingsQuery,
  WorkspaceMeetingsQueryVariables
> = gql`
  query workspaceMeetings(
    $committeeId: String!
    $view: String
    $from: String
    $to: String
    $text: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceMeetings(
      committeeId: $committeeId
      view: $view
      from: $from
      to: $to
      text: $text
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      data {
        ...WorkspaceMeetingFields
      }
      totalResults
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_MEETING_BY_ID: TypedDocumentNode<
  WorkspaceMeetingByIdQuery,
  WorkspaceMeetingByIdQueryVariables
> = gql`
  query workspaceMeetingById($committeeId: String!, $meetingId: String!) {
    workspaceMeetingById(committeeId: $committeeId, meetingId: $meetingId) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_MEETING_ATTACHMENTS: TypedDocumentNode<
  WorkspaceMeetingAttachmentsQuery,
  WorkspaceMeetingAttachmentsQueryVariables
> = gql`
  query workspaceMeetingAttachments($committeeId: String!, $meetingId: String!) {
    workspaceMeetingAttachments(committeeId: $committeeId, meetingId: $meetingId) {
      ...WorkspaceMeetingAttachmentFields
    }
  }
  ${ATTACHMENT_FIELDS}
`;

export const WORKSPACE_MEETING_ACTION_ITEMS: TypedDocumentNode<
  WorkspaceMeetingActionItemsQuery,
  WorkspaceMeetingActionItemsQueryVariables
> = gql`
  query workspaceMeetingActionItems(
    $committeeId: String!
    $meetingId: String
    $assigneeId: String
    $status: [String]
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceMeetingActionItems(
      committeeId: $committeeId
      meetingId: $meetingId
      assigneeId: $assigneeId
      status: $status
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      data {
        ...WorkspaceMeetingActionItemFields
      }
      totalResults
    }
  }
  ${ACTION_ITEM_FIELDS}
`;

export const WORKSPACE_MEETING_ACTIVITY: TypedDocumentNode<
  WorkspaceMeetingActivityQuery,
  WorkspaceMeetingActivityQueryVariables
> = gql`
  query workspaceMeetingActivity(
    $committeeId: String!
    $meetingId: String
    $before: String
    $limit: Int
  ) {
    workspaceMeetingActivity(
      committeeId: $committeeId
      meetingId: $meetingId
      before: $before
      limit: $limit
    ) {
      _id
      action
      entityType
      entityId
      meetingId
      userName
      at
      details
    }
  }
`;

export const WORKSPACE_CREATE_MEETING: TypedDocumentNode<
  WorkspaceCreateMeetingMutation,
  WorkspaceCreateMeetingMutationVariables
> = gql`
  mutation workspaceCreateMeeting(
    $committeeId: String!
    $input: WorkspaceMeetingInput!
    $participantIds: [String]
  ) {
    workspaceCreateMeeting(
      committeeId: $committeeId
      input: $input
      participantIds: $participantIds
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_UPDATE_MEETING: TypedDocumentNode<
  WorkspaceUpdateMeetingMutation,
  WorkspaceUpdateMeetingMutationVariables
> = gql`
  mutation workspaceUpdateMeeting(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingInput!
  ) {
    workspaceUpdateMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_CANCEL_MEETING: TypedDocumentNode<
  WorkspaceCancelMeetingMutation,
  WorkspaceCancelMeetingMutationVariables
> = gql`
  mutation workspaceCancelMeeting(
    $committeeId: String!
    $meetingId: String!
    $reason: String
  ) {
    workspaceCancelMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      reason: $reason
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_COMPLETE_MEETING: TypedDocumentNode<
  WorkspaceCompleteMeetingMutation,
  WorkspaceCompleteMeetingMutationVariables
> = gql`
  mutation workspaceCompleteMeeting($committeeId: String!, $meetingId: String!) {
    workspaceCompleteMeeting(committeeId: $committeeId, meetingId: $meetingId) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_REOPEN_MEETING: TypedDocumentNode<
  WorkspaceReopenMeetingMutation,
  WorkspaceReopenMeetingMutationVariables
> = gql`
  mutation workspaceReopenMeeting($committeeId: String!, $meetingId: String!) {
    workspaceReopenMeeting(committeeId: $committeeId, meetingId: $meetingId) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_DELETE_MEETING: TypedDocumentNode<
  WorkspaceDeleteMeetingMutation,
  WorkspaceDeleteMeetingMutationVariables
> = gql`
  mutation workspaceDeleteMeeting($committeeId: String!, $meetingId: String!) {
    workspaceDeleteMeeting(committeeId: $committeeId, meetingId: $meetingId)
  }
`;

export const WORKSPACE_SET_MEETING_PARTICIPANTS: TypedDocumentNode<
  WorkspaceSetMeetingParticipantsMutation,
  WorkspaceSetMeetingParticipantsMutationVariables
> = gql`
  mutation workspaceSetMeetingParticipants(
    $committeeId: String!
    $meetingId: String!
    $participantIds: [String]!
  ) {
    workspaceSetMeetingParticipants(
      committeeId: $committeeId
      meetingId: $meetingId
      participantIds: $participantIds
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_SET_MEETING_PARTICIPANT_ROLE: TypedDocumentNode<
  WorkspaceSetMeetingParticipantRoleMutation,
  WorkspaceSetMeetingParticipantRoleMutationVariables
> = gql`
  mutation workspaceSetMeetingParticipantRole(
    $committeeId: String!
    $meetingId: String!
    $participantId: String!
    $role: String!
  ) {
    workspaceSetMeetingParticipantRole(
      committeeId: $committeeId
      meetingId: $meetingId
      participantId: $participantId
      role: $role
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_RESPOND_TO_MEETING: TypedDocumentNode<
  WorkspaceRespondToMeetingMutation,
  WorkspaceRespondToMeetingMutationVariables
> = gql`
  mutation workspaceRespondToMeeting(
    $committeeId: String!
    $meetingId: String!
    $participantId: String
    $status: String!
    $comment: String
  ) {
    workspaceRespondToMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      participantId: $participantId
      status: $status
      comment: $comment
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_MARK_MEETING_ATTENDANCE: TypedDocumentNode<
  WorkspaceMarkMeetingAttendanceMutation,
  WorkspaceMarkMeetingAttendanceMutationVariables
> = gql`
  mutation workspaceMarkMeetingAttendance(
    $committeeId: String!
    $meetingId: String!
    $entries: [WorkspaceMeetingAttendanceInput]!
  ) {
    workspaceMarkMeetingAttendance(
      committeeId: $committeeId
      meetingId: $meetingId
      entries: $entries
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_ADD_MEETING_AGENDA_ITEM: TypedDocumentNode<
  WorkspaceAddMeetingAgendaItemMutation,
  WorkspaceAddMeetingAgendaItemMutationVariables
> = gql`
  mutation workspaceAddMeetingAgendaItem(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingAgendaItemInput!
  ) {
    workspaceAddMeetingAgendaItem(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_UPDATE_MEETING_AGENDA_ITEM: TypedDocumentNode<
  WorkspaceUpdateMeetingAgendaItemMutation,
  WorkspaceUpdateMeetingAgendaItemMutationVariables
> = gql`
  mutation workspaceUpdateMeetingAgendaItem(
    $committeeId: String!
    $meetingId: String!
    $agendaItemId: String!
    $input: WorkspaceMeetingAgendaItemInput!
  ) {
    workspaceUpdateMeetingAgendaItem(
      committeeId: $committeeId
      meetingId: $meetingId
      agendaItemId: $agendaItemId
      input: $input
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_REMOVE_MEETING_AGENDA_ITEM: TypedDocumentNode<
  WorkspaceRemoveMeetingAgendaItemMutation,
  WorkspaceRemoveMeetingAgendaItemMutationVariables
> = gql`
  mutation workspaceRemoveMeetingAgendaItem(
    $committeeId: String!
    $meetingId: String!
    $agendaItemId: String!
  ) {
    workspaceRemoveMeetingAgendaItem(
      committeeId: $committeeId
      meetingId: $meetingId
      agendaItemId: $agendaItemId
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_REORDER_MEETING_AGENDA: TypedDocumentNode<
  WorkspaceReorderMeetingAgendaMutation,
  WorkspaceReorderMeetingAgendaMutationVariables
> = gql`
  mutation workspaceReorderMeetingAgenda(
    $committeeId: String!
    $meetingId: String!
    $agendaItemIds: [String]!
  ) {
    workspaceReorderMeetingAgenda(
      committeeId: $committeeId
      meetingId: $meetingId
      agendaItemIds: $agendaItemIds
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_SET_MEETING_MINUTES: TypedDocumentNode<
  WorkspaceSetMeetingMinutesMutation,
  WorkspaceSetMeetingMinutesMutationVariables
> = gql`
  mutation workspaceSetMeetingMinutes(
    $committeeId: String!
    $meetingId: String!
    $text: String
  ) {
    workspaceSetMeetingMinutes(
      committeeId: $committeeId
      meetingId: $meetingId
      text: $text
    ) {
      ...WorkspaceMeetingFields
    }
  }
  ${MEETING_FIELDS}
`;

export const WORKSPACE_CREATE_MEETING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  WorkspaceCreateMeetingAttachmentUploadMutation,
  WorkspaceCreateMeetingAttachmentUploadMutationVariables
> = gql`
  mutation workspaceCreateMeetingAttachmentUpload(
    $committeeId: String!
    $meetingId: String!
    $fileName: String!
    $mimeType: String
    $size: Float!
  ) {
    workspaceCreateMeetingAttachmentUpload(
      committeeId: $committeeId
      meetingId: $meetingId
      fileName: $fileName
      mimeType: $mimeType
      size: $size
    ) {
      uploadId
      url
      contentType
      expiresAt
    }
  }
`;

export const WORKSPACE_COMPLETE_MEETING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  WorkspaceCompleteMeetingAttachmentUploadMutation,
  WorkspaceCompleteMeetingAttachmentUploadMutationVariables
> = gql`
  mutation workspaceCompleteMeetingAttachmentUpload($committeeId: String!, $uploadId: String!) {
    workspaceCompleteMeetingAttachmentUpload(committeeId: $committeeId, uploadId: $uploadId) {
      ...WorkspaceMeetingAttachmentFields
    }
  }
  ${ATTACHMENT_FIELDS}
`;

export const WORKSPACE_ABORT_MEETING_ATTACHMENT_UPLOAD: TypedDocumentNode<
  WorkspaceAbortMeetingAttachmentUploadMutation,
  WorkspaceAbortMeetingAttachmentUploadMutationVariables
> = gql`
  mutation workspaceAbortMeetingAttachmentUpload($committeeId: String!, $uploadId: String!) {
    workspaceAbortMeetingAttachmentUpload(committeeId: $committeeId, uploadId: $uploadId)
  }
`;

export const WORKSPACE_MEETING_ATTACHMENT_DOWNLOAD_URL: TypedDocumentNode<
  WorkspaceMeetingAttachmentDownloadUrlMutation,
  WorkspaceMeetingAttachmentDownloadUrlMutationVariables
> = gql`
  mutation workspaceMeetingAttachmentDownloadUrl(
    $committeeId: String!
    $attachmentId: String!
    $inline: Boolean
  ) {
    workspaceMeetingAttachmentDownloadUrl(
      committeeId: $committeeId
      attachmentId: $attachmentId
      inline: $inline
    ) {
      url
      fileName
    }
  }
`;

export const WORKSPACE_DELETE_MEETING_ATTACHMENT: TypedDocumentNode<
  WorkspaceDeleteMeetingAttachmentMutation,
  WorkspaceDeleteMeetingAttachmentMutationVariables
> = gql`
  mutation workspaceDeleteMeetingAttachment($committeeId: String!, $attachmentId: String!) {
    workspaceDeleteMeetingAttachment(committeeId: $committeeId, attachmentId: $attachmentId)
  }
`;

export const WORKSPACE_CREATE_MEETING_ACTION_ITEM: TypedDocumentNode<
  WorkspaceCreateMeetingActionItemMutation,
  WorkspaceCreateMeetingActionItemMutationVariables
> = gql`
  mutation workspaceCreateMeetingActionItem(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingActionItemInput!
  ) {
    workspaceCreateMeetingActionItem(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...WorkspaceMeetingActionItemFields
    }
  }
  ${ACTION_ITEM_FIELDS}
`;

export const WORKSPACE_UPDATE_MEETING_ACTION_ITEM: TypedDocumentNode<
  WorkspaceUpdateMeetingActionItemMutation,
  WorkspaceUpdateMeetingActionItemMutationVariables
> = gql`
  mutation workspaceUpdateMeetingActionItem(
    $committeeId: String!
    $actionItemId: String!
    $input: WorkspaceMeetingActionItemInput!
  ) {
    workspaceUpdateMeetingActionItem(
      committeeId: $committeeId
      actionItemId: $actionItemId
      input: $input
    ) {
      ...WorkspaceMeetingActionItemFields
    }
  }
  ${ACTION_ITEM_FIELDS}
`;

export const WORKSPACE_SET_MEETING_ACTION_ITEM_STATUS: TypedDocumentNode<
  WorkspaceSetMeetingActionItemStatusMutation,
  WorkspaceSetMeetingActionItemStatusMutationVariables
> = gql`
  mutation workspaceSetMeetingActionItemStatus(
    $committeeId: String!
    $actionItemId: String!
    $status: String!
  ) {
    workspaceSetMeetingActionItemStatus(
      committeeId: $committeeId
      actionItemId: $actionItemId
      status: $status
    ) {
      ...WorkspaceMeetingActionItemFields
    }
  }
  ${ACTION_ITEM_FIELDS}
`;

export const WORKSPACE_DELETE_MEETING_ACTION_ITEM: TypedDocumentNode<
  WorkspaceDeleteMeetingActionItemMutation,
  WorkspaceDeleteMeetingActionItemMutationVariables
> = gql`
  mutation workspaceDeleteMeetingActionItem($committeeId: String!, $actionItemId: String!) {
    workspaceDeleteMeetingActionItem(committeeId: $committeeId, actionItemId: $actionItemId)
  }
`;
