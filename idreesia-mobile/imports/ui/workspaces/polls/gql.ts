import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileCommitteePollNotificationsQuery,
  MobileCommitteePollNotificationsQueryVariables,
  MobileWorkspaceCancelPollMutation,
  MobileWorkspaceCancelPollMutationVariables,
  MobileWorkspaceCastPollVoteMutation,
  MobileWorkspaceCastPollVoteMutationVariables,
  MobileWorkspaceClosePollMutation,
  MobileWorkspaceClosePollMutationVariables,
  MobileWorkspaceCreatePollMutation,
  MobileWorkspaceCreatePollMutationVariables,
  MobileWorkspaceDeletePollMutation,
  MobileWorkspaceDeletePollMutationVariables,
  MobileWorkspaceOpenPollMutation,
  MobileWorkspaceOpenPollMutationVariables,
  MobileWorkspacePollActivityQuery,
  MobileWorkspacePollActivityQueryVariables,
  MobileWorkspacePollByIdQuery,
  MobileWorkspacePollByIdQueryVariables,
  MobileWorkspacePollResultsQuery,
  MobileWorkspacePollResultsQueryVariables,
  MobileWorkspacePollsInfoQuery,
  MobileWorkspacePollsInfoQueryVariables,
  MobileWorkspacePollsQuery,
  MobileWorkspacePollsQueryVariables,
  MobileWorkspaceReopenPollMutation,
  MobileWorkspaceReopenPollMutationVariables,
  MobileWorkspaceUpdatePollMutation,
  MobileWorkspaceUpdatePollMutationVariables,
  MobileWorkspaceWithdrawPollVoteMutation,
  MobileWorkspaceWithdrawPollVoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

/** Everything the poll screens show about a poll. */
const POLL_FIELDS = gql`
  fragment MobileWorkspacePollFields on WorkspacePollType {
    _id
    title
    description
    status
    anonymous
    closesAt
    openedAt
    closedAt
    closedByName
    cancelledAt
    cancelledByName
    cancellationReason
    questions {
      _id
      text
      description
      type
      required
      minChoices
      maxChoices
      options {
        _id
        text
      }
    }
    voteCount
    isEligible
    hasVoted
    myAnswers {
      questionId
      optionIds
    }
    canSeeResults
    createdAt
    createdByName
    updatedAt
  }
`;

/** Can the user manage polls, and their voter id. */
export const MOBILE_WORKSPACE_POLLS_INFO: TypedDocumentNode<
  MobileWorkspacePollsInfoQuery,
  MobileWorkspacePollsInfoQueryVariables
> = gql`
  query mobileWorkspacePollsInfo($committeeId: String!) {
    workspacePollsInfo(committeeId: $committeeId) {
      canManage
      myVoterId
    }
  }
`;

/** Rows of the polls list (polls-screen.tsx). */
export const MOBILE_WORKSPACE_POLLS: TypedDocumentNode<
  MobileWorkspacePollsQuery,
  MobileWorkspacePollsQueryVariables
> = gql`
  query mobileWorkspacePolls(
    $committeeId: String!
    $view: String
    $text: String
    $pageIndex: Int
    $pageSize: Int
  ) {
    workspacePolls(
      committeeId: $committeeId
      view: $view
      text: $text
      pageIndex: $pageIndex
      pageSize: $pageSize
    ) {
      totalResults
      data {
        ...MobileWorkspacePollFields
      }
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_WORKSPACE_POLL_BY_ID: TypedDocumentNode<
  MobileWorkspacePollByIdQuery,
  MobileWorkspacePollByIdQueryVariables
> = gql`
  query mobileWorkspacePollById($committeeId: String!, $pollId: String!) {
    workspacePollById(committeeId: $committeeId, pollId: $pollId) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_WORKSPACE_POLL_RESULTS: TypedDocumentNode<
  MobileWorkspacePollResultsQuery,
  MobileWorkspacePollResultsQueryVariables
> = gql`
  query mobileWorkspacePollResults($committeeId: String!, $pollId: String!) {
    workspacePollResults(committeeId: $committeeId, pollId: $pollId) {
      pollId
      status
      anonymous
      closedAt
      totalVoters
      questions {
        questionId
        text
        type
        answeredCount
        options {
          optionId
          text
          count
          percentage
          voters {
            voterId
            name
          }
        }
      }
    }
  }
`;

export const MOBILE_WORKSPACE_POLL_ACTIVITY: TypedDocumentNode<
  MobileWorkspacePollActivityQuery,
  MobileWorkspacePollActivityQueryVariables
> = gql`
  query mobileWorkspacePollActivity(
    $committeeId: String!
    $pollId: String
    $before: String
    $limit: Int
  ) {
    workspacePollActivity(
      committeeId: $committeeId
      pollId: $pollId
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

export const MOBILE_CREATE_POLL: TypedDocumentNode<
  MobileWorkspaceCreatePollMutation,
  MobileWorkspaceCreatePollMutationVariables
> = gql`
  mutation mobileWorkspaceCreatePoll($committeeId: String!, $input: WorkspacePollInput!) {
    workspaceCreatePoll(committeeId: $committeeId, input: $input) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_UPDATE_POLL: TypedDocumentNode<
  MobileWorkspaceUpdatePollMutation,
  MobileWorkspaceUpdatePollMutationVariables
> = gql`
  mutation mobileWorkspaceUpdatePoll(
    $committeeId: String!
    $pollId: String!
    $input: WorkspacePollInput!
  ) {
    workspaceUpdatePoll(committeeId: $committeeId, pollId: $pollId, input: $input) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_OPEN_POLL: TypedDocumentNode<
  MobileWorkspaceOpenPollMutation,
  MobileWorkspaceOpenPollMutationVariables
> = gql`
  mutation mobileWorkspaceOpenPoll($committeeId: String!, $pollId: String!, $closesAt: String) {
    workspaceOpenPoll(committeeId: $committeeId, pollId: $pollId, closesAt: $closesAt) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_CLOSE_POLL: TypedDocumentNode<
  MobileWorkspaceClosePollMutation,
  MobileWorkspaceClosePollMutationVariables
> = gql`
  mutation mobileWorkspaceClosePoll($committeeId: String!, $pollId: String!) {
    workspaceClosePoll(committeeId: $committeeId, pollId: $pollId) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_REOPEN_POLL: TypedDocumentNode<
  MobileWorkspaceReopenPollMutation,
  MobileWorkspaceReopenPollMutationVariables
> = gql`
  mutation mobileWorkspaceReopenPoll($committeeId: String!, $pollId: String!, $closesAt: String!) {
    workspaceReopenPoll(committeeId: $committeeId, pollId: $pollId, closesAt: $closesAt) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_CANCEL_POLL: TypedDocumentNode<
  MobileWorkspaceCancelPollMutation,
  MobileWorkspaceCancelPollMutationVariables
> = gql`
  mutation mobileWorkspaceCancelPoll($committeeId: String!, $pollId: String!, $reason: String) {
    workspaceCancelPoll(committeeId: $committeeId, pollId: $pollId, reason: $reason) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_DELETE_POLL: TypedDocumentNode<
  MobileWorkspaceDeletePollMutation,
  MobileWorkspaceDeletePollMutationVariables
> = gql`
  mutation mobileWorkspaceDeletePoll($committeeId: String!, $pollId: String!) {
    workspaceDeletePoll(committeeId: $committeeId, pollId: $pollId)
  }
`;

export const MOBILE_CAST_POLL_VOTE: TypedDocumentNode<
  MobileWorkspaceCastPollVoteMutation,
  MobileWorkspaceCastPollVoteMutationVariables
> = gql`
  mutation mobileWorkspaceCastPollVote(
    $committeeId: String!
    $pollId: String!
    $answers: [WorkspacePollAnswerInput]!
  ) {
    workspaceCastPollVote(committeeId: $committeeId, pollId: $pollId, answers: $answers) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const MOBILE_WITHDRAW_POLL_VOTE: TypedDocumentNode<
  MobileWorkspaceWithdrawPollVoteMutation,
  MobileWorkspaceWithdrawPollVoteMutationVariables
> = gql`
  mutation mobileWorkspaceWithdrawPollVote($committeeId: String!, $pollId: String!) {
    workspaceWithdrawPollVote(committeeId: $committeeId, pollId: $pollId) {
      ...MobileWorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

// The committee's poll notifications for the signed-in user, newest first.
export const MOBILE_COMMITTEE_POLL_NOTIFICATIONS: TypedDocumentNode<
  MobileCommitteePollNotificationsQuery,
  MobileCommitteePollNotificationsQueryVariables
> = gql`
  query mobileCommitteePollNotifications($committeeId: String!, $limit: Int!, $offset: Int) {
    myNotifications(committeeId: $committeeId, module: "polls", limit: $limit, offset: $offset) {
      _id
      entityId
      eventType
      eventDetails
      createdAt
      isRead
    }
  }
`;
