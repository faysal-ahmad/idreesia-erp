import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceAbortMeetingAttachmentUploadMutation,
  MobileWorkspaceAbortMeetingAttachmentUploadMutationVariables,
  MobileWorkspaceAddMeetingAgendaItemMutation,
  MobileWorkspaceAddMeetingAgendaItemMutationVariables,
  MobileWorkspaceCancelMeetingMutation,
  MobileWorkspaceCancelMeetingMutationVariables,
  MobileWorkspaceCompleteMeetingAttachmentUploadMutation,
  MobileWorkspaceCompleteMeetingAttachmentUploadMutationVariables,
  MobileWorkspaceCompleteMeetingMutation,
  MobileWorkspaceCompleteMeetingMutationVariables,
  MobileWorkspaceCreateMeetingActionItemMutation,
  MobileWorkspaceCreateMeetingActionItemMutationVariables,
  MobileWorkspaceCreateMeetingAttachmentUploadMutation,
  MobileWorkspaceCreateMeetingAttachmentUploadMutationVariables,
  MobileWorkspaceCreateMeetingMutation,
  MobileWorkspaceCreateMeetingMutationVariables,
  MobileWorkspaceDeleteMeetingActionItemMutation,
  MobileWorkspaceDeleteMeetingActionItemMutationVariables,
  MobileWorkspaceDeleteMeetingAttachmentMutation,
  MobileWorkspaceDeleteMeetingAttachmentMutationVariables,
  MobileWorkspaceDeleteMeetingMutation,
  MobileWorkspaceDeleteMeetingMutationVariables,
  MobileWorkspaceMarkMeetingAttendanceMutation,
  MobileWorkspaceMarkMeetingAttendanceMutationVariables,
  MobileWorkspaceMeetingAttachmentDownloadUrlMutation,
  MobileWorkspaceMeetingAttachmentDownloadUrlMutationVariables,
  MobileWorkspaceRemoveMeetingAgendaItemMutation,
  MobileWorkspaceRemoveMeetingAgendaItemMutationVariables,
  MobileWorkspaceReopenMeetingMutation,
  MobileWorkspaceReopenMeetingMutationVariables,
  MobileWorkspaceReorderMeetingAgendaMutation,
  MobileWorkspaceReorderMeetingAgendaMutationVariables,
  MobileWorkspaceRespondToMeetingMutation,
  MobileWorkspaceRespondToMeetingMutationVariables,
  MobileWorkspaceSetMeetingActionItemStatusMutation,
  MobileWorkspaceSetMeetingActionItemStatusMutationVariables,
  MobileWorkspaceSetMeetingMinutesMutation,
  MobileWorkspaceSetMeetingMinutesMutationVariables,
  MobileWorkspaceSetMeetingParticipantRoleMutation,
  MobileWorkspaceSetMeetingParticipantRoleMutationVariables,
  MobileWorkspaceSetMeetingParticipantsMutation,
  MobileWorkspaceSetMeetingParticipantsMutationVariables,
  MobileWorkspaceUpdateMeetingActionItemMutation,
  MobileWorkspaceUpdateMeetingActionItemMutationVariables,
  MobileWorkspaceUpdateMeetingAgendaItemMutation,
  MobileWorkspaceUpdateMeetingAgendaItemMutationVariables,
  MobileWorkspaceUpdateMeetingMutation,
  MobileWorkspaceUpdateMeetingMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MOBILE_WORKSPACE_MEETING_FIELDS,
  MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS,
} from './meeting-fields';

export const MOBILE_CREATE_MEETING: TypedDocumentNode<
  MobileWorkspaceCreateMeetingMutation,
  MobileWorkspaceCreateMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceCreateMeeting(
    $committeeId: String!
    $input: WorkspaceMeetingInput!
    $participantIds: [String]
  ) {
    workspaceCreateMeeting(
      committeeId: $committeeId
      input: $input
      participantIds: $participantIds
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_UPDATE_MEETING: TypedDocumentNode<
  MobileWorkspaceUpdateMeetingMutation,
  MobileWorkspaceUpdateMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateMeeting(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingInput!
  ) {
    workspaceUpdateMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_CANCEL_MEETING: TypedDocumentNode<
  MobileWorkspaceCancelMeetingMutation,
  MobileWorkspaceCancelMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceCancelMeeting(
    $committeeId: String!
    $meetingId: String!
    $reason: String
  ) {
    workspaceCancelMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      reason: $reason
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_COMPLETE_MEETING: TypedDocumentNode<
  MobileWorkspaceCompleteMeetingMutation,
  MobileWorkspaceCompleteMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceCompleteMeeting($committeeId: String!, $meetingId: String!) {
    workspaceCompleteMeeting(committeeId: $committeeId, meetingId: $meetingId) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_REOPEN_MEETING: TypedDocumentNode<
  MobileWorkspaceReopenMeetingMutation,
  MobileWorkspaceReopenMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceReopenMeeting($committeeId: String!, $meetingId: String!) {
    workspaceReopenMeeting(committeeId: $committeeId, meetingId: $meetingId) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_DELETE_MEETING: TypedDocumentNode<
  MobileWorkspaceDeleteMeetingMutation,
  MobileWorkspaceDeleteMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteMeeting($committeeId: String!, $meetingId: String!) {
    workspaceDeleteMeeting(committeeId: $committeeId, meetingId: $meetingId)
  }
`;

export const MOBILE_MEETING_SET_PARTICIPANTS: TypedDocumentNode<
  MobileWorkspaceSetMeetingParticipantsMutation,
  MobileWorkspaceSetMeetingParticipantsMutationVariables
> = gql`
  mutation mobileWorkspaceSetMeetingParticipants(
    $committeeId: String!
    $meetingId: String!
    $participantIds: [String]!
  ) {
    workspaceSetMeetingParticipants(
      committeeId: $committeeId
      meetingId: $meetingId
      participantIds: $participantIds
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_SET_PARTICIPANT_ROLE: TypedDocumentNode<
  MobileWorkspaceSetMeetingParticipantRoleMutation,
  MobileWorkspaceSetMeetingParticipantRoleMutationVariables
> = gql`
  mutation mobileWorkspaceSetMeetingParticipantRole(
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
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_RESPOND: TypedDocumentNode<
  MobileWorkspaceRespondToMeetingMutation,
  MobileWorkspaceRespondToMeetingMutationVariables
> = gql`
  mutation mobileWorkspaceRespondToMeeting(
    $committeeId: String!
    $meetingId: String!
    $status: String!
  ) {
    workspaceRespondToMeeting(
      committeeId: $committeeId
      meetingId: $meetingId
      status: $status
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_MARK_ATTENDANCE: TypedDocumentNode<
  MobileWorkspaceMarkMeetingAttendanceMutation,
  MobileWorkspaceMarkMeetingAttendanceMutationVariables
> = gql`
  mutation mobileWorkspaceMarkMeetingAttendance(
    $committeeId: String!
    $meetingId: String!
    $entries: [WorkspaceMeetingAttendanceInput]!
  ) {
    workspaceMarkMeetingAttendance(
      committeeId: $committeeId
      meetingId: $meetingId
      entries: $entries
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_ADD_AGENDA_ITEM: TypedDocumentNode<
  MobileWorkspaceAddMeetingAgendaItemMutation,
  MobileWorkspaceAddMeetingAgendaItemMutationVariables
> = gql`
  mutation mobileWorkspaceAddMeetingAgendaItem(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingAgendaItemInput!
  ) {
    workspaceAddMeetingAgendaItem(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_UPDATE_AGENDA_ITEM: TypedDocumentNode<
  MobileWorkspaceUpdateMeetingAgendaItemMutation,
  MobileWorkspaceUpdateMeetingAgendaItemMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateMeetingAgendaItem(
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
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_REMOVE_AGENDA_ITEM: TypedDocumentNode<
  MobileWorkspaceRemoveMeetingAgendaItemMutation,
  MobileWorkspaceRemoveMeetingAgendaItemMutationVariables
> = gql`
  mutation mobileWorkspaceRemoveMeetingAgendaItem(
    $committeeId: String!
    $meetingId: String!
    $agendaItemId: String!
  ) {
    workspaceRemoveMeetingAgendaItem(
      committeeId: $committeeId
      meetingId: $meetingId
      agendaItemId: $agendaItemId
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_REORDER_AGENDA: TypedDocumentNode<
  MobileWorkspaceReorderMeetingAgendaMutation,
  MobileWorkspaceReorderMeetingAgendaMutationVariables
> = gql`
  mutation mobileWorkspaceReorderMeetingAgenda(
    $committeeId: String!
    $meetingId: String!
    $agendaItemIds: [String]!
  ) {
    workspaceReorderMeetingAgenda(
      committeeId: $committeeId
      meetingId: $meetingId
      agendaItemIds: $agendaItemIds
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_SET_MINUTES: TypedDocumentNode<
  MobileWorkspaceSetMeetingMinutesMutation,
  MobileWorkspaceSetMeetingMinutesMutationVariables
> = gql`
  mutation mobileWorkspaceSetMeetingMinutes(
    $committeeId: String!
    $meetingId: String!
    $text: String
  ) {
    workspaceSetMeetingMinutes(
      committeeId: $committeeId
      meetingId: $meetingId
      text: $text
    ) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

export const MOBILE_MEETING_CREATE_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceCreateMeetingAttachmentUploadMutation,
  MobileWorkspaceCreateMeetingAttachmentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceCreateMeetingAttachmentUpload(
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
    }
  }
`;

export const MOBILE_MEETING_COMPLETE_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceCompleteMeetingAttachmentUploadMutation,
  MobileWorkspaceCompleteMeetingAttachmentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceCompleteMeetingAttachmentUpload($committeeId: String!, $uploadId: String!) {
    workspaceCompleteMeetingAttachmentUpload(committeeId: $committeeId, uploadId: $uploadId) {
      _id
    }
  }
`;

export const MOBILE_MEETING_ABORT_ATTACHMENT_UPLOAD: TypedDocumentNode<
  MobileWorkspaceAbortMeetingAttachmentUploadMutation,
  MobileWorkspaceAbortMeetingAttachmentUploadMutationVariables
> = gql`
  mutation mobileWorkspaceAbortMeetingAttachmentUpload($committeeId: String!, $uploadId: String!) {
    workspaceAbortMeetingAttachmentUpload(committeeId: $committeeId, uploadId: $uploadId)
  }
`;

export const MOBILE_MEETING_ATTACHMENT_DOWNLOAD_URL: TypedDocumentNode<
  MobileWorkspaceMeetingAttachmentDownloadUrlMutation,
  MobileWorkspaceMeetingAttachmentDownloadUrlMutationVariables
> = gql`
  mutation mobileWorkspaceMeetingAttachmentDownloadUrl(
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

export const MOBILE_MEETING_DELETE_ATTACHMENT: TypedDocumentNode<
  MobileWorkspaceDeleteMeetingAttachmentMutation,
  MobileWorkspaceDeleteMeetingAttachmentMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteMeetingAttachment($committeeId: String!, $attachmentId: String!) {
    workspaceDeleteMeetingAttachment(committeeId: $committeeId, attachmentId: $attachmentId)
  }
`;

export const MOBILE_MEETING_CREATE_ACTION_ITEM: TypedDocumentNode<
  MobileWorkspaceCreateMeetingActionItemMutation,
  MobileWorkspaceCreateMeetingActionItemMutationVariables
> = gql`
  mutation mobileWorkspaceCreateMeetingActionItem(
    $committeeId: String!
    $meetingId: String!
    $input: WorkspaceMeetingActionItemInput!
  ) {
    workspaceCreateMeetingActionItem(
      committeeId: $committeeId
      meetingId: $meetingId
      input: $input
    ) {
      ...MobileWorkspaceMeetingActionItemFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS}
`;

export const MOBILE_MEETING_UPDATE_ACTION_ITEM: TypedDocumentNode<
  MobileWorkspaceUpdateMeetingActionItemMutation,
  MobileWorkspaceUpdateMeetingActionItemMutationVariables
> = gql`
  mutation mobileWorkspaceUpdateMeetingActionItem(
    $committeeId: String!
    $actionItemId: String!
    $input: WorkspaceMeetingActionItemInput!
  ) {
    workspaceUpdateMeetingActionItem(
      committeeId: $committeeId
      actionItemId: $actionItemId
      input: $input
    ) {
      ...MobileWorkspaceMeetingActionItemFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS}
`;

export const MOBILE_MEETING_SET_ACTION_ITEM_STATUS: TypedDocumentNode<
  MobileWorkspaceSetMeetingActionItemStatusMutation,
  MobileWorkspaceSetMeetingActionItemStatusMutationVariables
> = gql`
  mutation mobileWorkspaceSetMeetingActionItemStatus(
    $committeeId: String!
    $actionItemId: String!
    $status: String!
  ) {
    workspaceSetMeetingActionItemStatus(
      committeeId: $committeeId
      actionItemId: $actionItemId
      status: $status
    ) {
      ...MobileWorkspaceMeetingActionItemFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS}
`;

export const MOBILE_MEETING_DELETE_ACTION_ITEM: TypedDocumentNode<
  MobileWorkspaceDeleteMeetingActionItemMutation,
  MobileWorkspaceDeleteMeetingActionItemMutationVariables
> = gql`
  mutation mobileWorkspaceDeleteMeetingActionItem($committeeId: String!, $actionItemId: String!) {
    workspaceDeleteMeetingActionItem(committeeId: $committeeId, actionItemId: $actionItemId)
  }
`;
