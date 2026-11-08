import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceMeetingActionItemsQuery,
  MobileWorkspaceMeetingActionItemsQueryVariables,
  MobileWorkspaceMeetingActivityQuery,
  MobileWorkspaceMeetingActivityQueryVariables,
  MobileWorkspaceMeetingAttachmentsQuery,
  MobileWorkspaceMeetingAttachmentsQueryVariables,
  MobileWorkspaceMeetingByIdQuery,
  MobileWorkspaceMeetingByIdQueryVariables,
  MobileWorkspaceMeetingMembersQuery,
  MobileWorkspaceMeetingMembersQueryVariables,
  MobileWorkspaceMeetingsInfoQuery,
  MobileWorkspaceMeetingsInfoQueryVariables,
  MobileWorkspaceMeetingsQuery,
  MobileWorkspaceMeetingsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MOBILE_WORKSPACE_MEETING_FIELDS,
  MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS,
} from './meeting-fields';

/** Can the user manage meetings, and their participant id. */
export const MOBILE_WORKSPACE_MEETINGS_INFO: TypedDocumentNode<
  MobileWorkspaceMeetingsInfoQuery,
  MobileWorkspaceMeetingsInfoQueryVariables
> = gql`
  query mobileWorkspaceMeetingsInfo($committeeId: String!) {
    workspaceMeetingsInfo(committeeId: $committeeId) {
      canManage
      myParticipantId
      maxFileSize
    }
  }
`;

/** The committee members who can be invited. */
export const MOBILE_WORKSPACE_MEETING_MEMBERS: TypedDocumentNode<
  MobileWorkspaceMeetingMembersQuery,
  MobileWorkspaceMeetingMembersQueryVariables
> = gql`
  query mobileWorkspaceMeetingMembers($committeeId: String!) {
    workspaceMeetingMembers(committeeId: $committeeId) {
      participantId
      name
      isCoordinator
    }
  }
`;

/** Rows of the meetings list (meetings-screen.tsx). */
export const MOBILE_WORKSPACE_MEETINGS: TypedDocumentNode<
  MobileWorkspaceMeetingsQuery,
  MobileWorkspaceMeetingsQueryVariables
> = gql`
  query mobileWorkspaceMeetings(
    $committeeId: String!
    $view: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspaceMeetings(
      committeeId: $committeeId
      view: $view
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspaceMeetingFields
      }
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

/** One meeting, for the meeting screen and the screens under it. */
export const MOBILE_WORKSPACE_MEETING_BY_ID: TypedDocumentNode<
  MobileWorkspaceMeetingByIdQuery,
  MobileWorkspaceMeetingByIdQueryVariables
> = gql`
  query mobileWorkspaceMeetingById($committeeId: String!, $meetingId: String!) {
    workspaceMeetingById(committeeId: $committeeId, meetingId: $meetingId) {
      ...MobileWorkspaceMeetingFields
    }
  }
  ${MOBILE_WORKSPACE_MEETING_FIELDS}
`;

/** A meeting's attachments. */
export const MOBILE_WORKSPACE_MEETING_ATTACHMENTS: TypedDocumentNode<
  MobileWorkspaceMeetingAttachmentsQuery,
  MobileWorkspaceMeetingAttachmentsQueryVariables
> = gql`
  query mobileWorkspaceMeetingAttachments($committeeId: String!, $meetingId: String!) {
    workspaceMeetingAttachments(committeeId: $committeeId, meetingId: $meetingId) {
      _id
      name
      fileName
      mimeType
      size
      createdAt
      createdByName
      canDelete
    }
  }
`;

/** A meeting's action items. */
export const MOBILE_WORKSPACE_MEETING_ACTION_ITEMS: TypedDocumentNode<
  MobileWorkspaceMeetingActionItemsQuery,
  MobileWorkspaceMeetingActionItemsQueryVariables
> = gql`
  query mobileWorkspaceMeetingActionItems(
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
      totalResults
      data {
        ...MobileWorkspaceMeetingActionItemFields
      }
    }
  }
  ${MOBILE_WORKSPACE_MEETING_ACTION_ITEM_FIELDS}
`;

/** A meeting's activity, newest first. */
export const MOBILE_WORKSPACE_MEETING_ACTIVITY: TypedDocumentNode<
  MobileWorkspaceMeetingActivityQuery,
  MobileWorkspaceMeetingActivityQueryVariables
> = gql`
  query mobileWorkspaceMeetingActivity(
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
      userName
      at
      details
    }
  }
`;
