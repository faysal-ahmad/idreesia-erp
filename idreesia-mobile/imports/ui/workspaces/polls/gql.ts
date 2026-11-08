import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobileWorkspaceAddPollVotersMutation,
  MobileWorkspaceAddPollVotersMutationVariables,
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
  MobileWorkspacePollMembersQuery,
  MobileWorkspacePollMembersQueryVariables,
  MobileWorkspacePollResultsQuery,
  MobileWorkspacePollResultsQueryVariables,
  MobileWorkspacePollsInfoQuery,
  MobileWorkspacePollsInfoQueryVariables,
  MobileWorkspacePollsQuery,
  MobileWorkspacePollsQueryVariables,
  MobileWorkspacePollVotersQuery,
  MobileWorkspacePollVotersQueryVariables,
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
    showResultsWhileOpen
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
    eligibleVoterIds
    eligibleCount
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

/** The committee members who can be made eligible to vote. */
export const MOBILE_WORKSPACE_POLL_MEMBERS: TypedDocumentNode<
  MobileWorkspacePollMembersQuery,
  MobileWorkspacePollMembersQueryVariables
> = gql`
  query mobileWorkspacePollMembers($committeeId: String!) {
    workspacePollMembers(committeeId: $committeeId) {
      voterId
      name
      isCoordinator
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
      eligibleCount
      turnout
      nonVoters {
        voterId
        name
      }
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

/** Coordinators: who can vote and, for named polls, who has. */
export const MOBILE_WORKSPACE_POLL_VOTERS: TypedDocumentNode<
  MobileWorkspacePollVotersQuery,
  MobileWorkspacePollVotersQueryVariables
> = gql`
  query mobileWorkspacePollVoters($committeeId: String!, $pollId: String!) {
    workspacePollVoters(committeeId: $committeeId, pollId: $pollId) {
      voterId
      name
      hasVoted
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

export const MOBILE_ADD_POLL_VOTERS: TypedDocumentNode<
  MobileWorkspaceAddPollVotersMutation,
  MobileWorkspaceAddPollVotersMutationVariables
> = gql`
  mutation mobileWorkspaceAddPollVoters(
    $committeeId: String!
    $pollId: String!
    $voterIds: [String]!
  ) {
    workspaceAddPollVoters(committeeId: $committeeId, pollId: $pollId, voterIds: $voterIds) {
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
