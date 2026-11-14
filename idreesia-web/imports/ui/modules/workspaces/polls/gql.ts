import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';

import type {
  WorkspaceCancelPollMutation,
  WorkspaceCancelPollMutationVariables,
  WorkspaceCastPollVoteMutation,
  WorkspaceCastPollVoteMutationVariables,
  WorkspaceClosePollMutation,
  WorkspaceClosePollMutationVariables,
  WorkspaceCreatePollMutation,
  WorkspaceCreatePollMutationVariables,
  WorkspaceDeletePollMutation,
  WorkspaceDeletePollMutationVariables,
  WorkspaceOpenPollMutation,
  WorkspaceOpenPollMutationVariables,
  WorkspacePollActivityQuery,
  WorkspacePollActivityQueryVariables,
  WorkspacePollByIdQuery,
  WorkspacePollByIdQueryVariables,
  WorkspacePollResultsQuery,
  WorkspacePollResultsQueryVariables,
  WorkspacePollsInfoQuery,
  WorkspacePollsInfoQueryVariables,
  WorkspacePollsQuery,
  WorkspacePollsQueryVariables,
  WorkspaceReopenPollMutation,
  WorkspaceReopenPollMutationVariables,
  WorkspaceUpdatePollMutation,
  WorkspaceUpdatePollMutationVariables,
  WorkspaceWithdrawPollVoteMutation,
  WorkspaceWithdrawPollVoteMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const POLL_FIELDS = gql`
  fragment WorkspacePollFields on WorkspacePollType {
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
    updatedByName
  }
`;

export const WORKSPACE_POLLS_INFO: TypedDocumentNode<
  WorkspacePollsInfoQuery,
  WorkspacePollsInfoQueryVariables
> = gql`
  query workspacePollsInfo($committeeId: String!) {
    workspacePollsInfo(committeeId: $committeeId) {
      canManage
      myVoterId
    }
  }
`;

export const WORKSPACE_POLLS: TypedDocumentNode<
  WorkspacePollsQuery,
  WorkspacePollsQueryVariables
> = gql`
  query workspacePolls(
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
      data {
        ...WorkspacePollFields
      }
      totalResults
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_POLL_BY_ID: TypedDocumentNode<
  WorkspacePollByIdQuery,
  WorkspacePollByIdQueryVariables
> = gql`
  query workspacePollById($committeeId: String!, $pollId: String!) {
    workspacePollById(committeeId: $committeeId, pollId: $pollId) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_POLL_RESULTS: TypedDocumentNode<
  WorkspacePollResultsQuery,
  WorkspacePollResultsQueryVariables
> = gql`
  query workspacePollResults($committeeId: String!, $pollId: String!) {
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

export const WORKSPACE_POLL_ACTIVITY: TypedDocumentNode<
  WorkspacePollActivityQuery,
  WorkspacePollActivityQueryVariables
> = gql`
  query workspacePollActivity(
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
      entityType
      entityId
      pollId
      userName
      at
      details
    }
  }
`;

export const WORKSPACE_CREATE_POLL: TypedDocumentNode<
  WorkspaceCreatePollMutation,
  WorkspaceCreatePollMutationVariables
> = gql`
  mutation workspaceCreatePoll($committeeId: String!, $input: WorkspacePollInput!) {
    workspaceCreatePoll(committeeId: $committeeId, input: $input) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_UPDATE_POLL: TypedDocumentNode<
  WorkspaceUpdatePollMutation,
  WorkspaceUpdatePollMutationVariables
> = gql`
  mutation workspaceUpdatePoll(
    $committeeId: String!
    $pollId: String!
    $input: WorkspacePollInput!
  ) {
    workspaceUpdatePoll(
      committeeId: $committeeId
      pollId: $pollId
      input: $input
    ) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_OPEN_POLL: TypedDocumentNode<
  WorkspaceOpenPollMutation,
  WorkspaceOpenPollMutationVariables
> = gql`
  mutation workspaceOpenPoll(
    $committeeId: String!
    $pollId: String!
    $closesAt: String
  ) {
    workspaceOpenPoll(
      committeeId: $committeeId
      pollId: $pollId
      closesAt: $closesAt
    ) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_CLOSE_POLL: TypedDocumentNode<
  WorkspaceClosePollMutation,
  WorkspaceClosePollMutationVariables
> = gql`
  mutation workspaceClosePoll($committeeId: String!, $pollId: String!) {
    workspaceClosePoll(committeeId: $committeeId, pollId: $pollId) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_REOPEN_POLL: TypedDocumentNode<
  WorkspaceReopenPollMutation,
  WorkspaceReopenPollMutationVariables
> = gql`
  mutation workspaceReopenPoll(
    $committeeId: String!
    $pollId: String!
    $closesAt: String!
  ) {
    workspaceReopenPoll(
      committeeId: $committeeId
      pollId: $pollId
      closesAt: $closesAt
    ) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_CANCEL_POLL: TypedDocumentNode<
  WorkspaceCancelPollMutation,
  WorkspaceCancelPollMutationVariables
> = gql`
  mutation workspaceCancelPoll(
    $committeeId: String!
    $pollId: String!
    $reason: String
  ) {
    workspaceCancelPoll(
      committeeId: $committeeId
      pollId: $pollId
      reason: $reason
    ) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_DELETE_POLL: TypedDocumentNode<
  WorkspaceDeletePollMutation,
  WorkspaceDeletePollMutationVariables
> = gql`
  mutation workspaceDeletePoll($committeeId: String!, $pollId: String!) {
    workspaceDeletePoll(committeeId: $committeeId, pollId: $pollId)
  }
`;

export const WORKSPACE_CAST_POLL_VOTE: TypedDocumentNode<
  WorkspaceCastPollVoteMutation,
  WorkspaceCastPollVoteMutationVariables
> = gql`
  mutation workspaceCastPollVote(
    $committeeId: String!
    $pollId: String!
    $answers: [WorkspacePollAnswerInput]!
  ) {
    workspaceCastPollVote(
      committeeId: $committeeId
      pollId: $pollId
      answers: $answers
    ) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;

export const WORKSPACE_WITHDRAW_POLL_VOTE: TypedDocumentNode<
  WorkspaceWithdrawPollVoteMutation,
  WorkspaceWithdrawPollVoteMutationVariables
> = gql`
  mutation workspaceWithdrawPollVote($committeeId: String!, $pollId: String!) {
    workspaceWithdrawPollVote(committeeId: $committeeId, pollId: $pollId) {
      ...WorkspacePollFields
    }
  }
  ${POLL_FIELDS}
`;
