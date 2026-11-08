import gql from 'graphql-tag';

// A committee's polls in the Workspaces module (Polls feature), backed by
// the polls module. Voters are committee members (karkun ids). Timestamps
// are milliseconds as strings. Anonymous polls never name voters.
export default gql`
  type WorkspacePollsInfoType {
    # The logged-in user is a coordinator: can create and manage polls.
    canManage: Boolean
    # The logged-in user's voter id (karkun id), if they can vote.
    myVoterId: String
  }

  type WorkspacePollMemberType {
    voterId: String
    name: String
    isCoordinator: Boolean
  }

  type WorkspacePollOptionType {
    _id: String
    text: String
  }

  type WorkspacePollQuestionType {
    _id: String
    text: String
    description: String
    # single or multiple
    type: String
    required: Boolean
    minChoices: Int
    maxChoices: Int
    options: [WorkspacePollOptionType]
  }

  type WorkspacePollAnswerType {
    questionId: String
    optionIds: [String]
  }

  type WorkspacePollType {
    _id: String
    title: String
    description: String
    # draft, open, closed or cancelled
    status: String
    anonymous: Boolean
    showResultsWhileOpen: Boolean
    closesAt: String
    openedAt: String
    # Set when the poll has closed. closedByName is empty when it closed
    # on its own at closesAt.
    closedAt: String
    closedByName: String
    cancelledAt: String
    cancelledByName: String
    cancellationReason: String
    questions: [WorkspacePollQuestionType]
    eligibleVoterIds: [String]
    eligibleCount: Int
    voteCount: Int
    # The logged-in user can vote in this poll.
    isEligible: Boolean
    hasVoted: Boolean
    # The logged-in user's own answers, if they have voted.
    myAnswers: [WorkspacePollAnswerType]
    canSeeResults: Boolean
    createdAt: String
    createdByName: String
    updatedAt: String
    updatedByName: String
  }

  type PagedWorkspacePollType {
    data: [WorkspacePollType]
    totalResults: Int
  }

  type WorkspacePollVoterType {
    voterId: String
    name: String
    # Unset for anonymous polls.
    hasVoted: Boolean
  }

  type WorkspacePollOptionResultType {
    optionId: String
    text: String
    count: Int
    percentage: Float
    # Who chose it. Unset for anonymous polls.
    voters: [WorkspacePollVoterType]
  }

  type WorkspacePollQuestionResultType {
    questionId: String
    text: String
    type: String
    answeredCount: Int
    options: [WorkspacePollOptionResultType]
  }

  type WorkspacePollResultsType {
    pollId: String
    status: String
    anonymous: Boolean
    closedAt: String
    totalVoters: Int
    eligibleCount: Int
    # Percentage of eligible voters who voted.
    turnout: Float
    # Eligible voters who didn't vote. Unset for anonymous polls.
    nonVoters: [WorkspacePollVoterType]
    questions: [WorkspacePollQuestionResultType]
  }

  type WorkspacePollActivityType {
    _id: String
    action: String
    entityType: String
    entityId: String
    pollId: String
    userName: String
    at: String
    # JSON
    details: String
  }

  input WorkspacePollOptionInput {
    # Keeps an existing option; leave empty for a new one.
    _id: String
    text: String!
  }

  input WorkspacePollQuestionInput {
    # Keeps an existing question; leave empty for a new one.
    _id: String
    text: String!
    description: String
    # single (default) or multiple
    type: String
    required: Boolean
    minChoices: Int
    maxChoices: Int
    options: [WorkspacePollOptionInput]!
  }

  input WorkspacePollInput {
    title: String!
    description: String
    closesAt: String!
    # Drafts only.
    anonymous: Boolean
    showResultsWhileOpen: Boolean
    # Drafts only. Empty: every committee member.
    eligibleVoterIds: [String]
    # Drafts only.
    questions: [WorkspacePollQuestionInput]
  }

  input WorkspacePollAnswerInput {
    questionId: String!
    optionIds: [String]
  }

  extend type Query {
    workspacePollsInfo(committeeId: String!): WorkspacePollsInfoType
    # The committee's members, who can be made eligible to vote.
    workspacePollMembers(committeeId: String!): [WorkspacePollMemberType]
    # view: open (default), closed, drafts (coordinators) or all.
    workspacePolls(
      committeeId: String!
      view: String
      text: String
      pageIndex: Int
      pageSize: Int
    ): PagedWorkspacePollType
    workspacePollById(committeeId: String!, pollId: String!): WorkspacePollType
    # Once the poll has closed (or while open, if the poll allows it).
    workspacePollResults(
      committeeId: String!
      pollId: String!
    ): WorkspacePollResultsType
    # Coordinators only.
    workspacePollVoters(
      committeeId: String!
      pollId: String!
    ): [WorkspacePollVoterType]
    # Coordinators only. Newest first; pass the last entry's 'at' as
    # 'before' for the next page.
    workspacePollActivity(
      committeeId: String!
      pollId: String
      before: String
      limit: Int
    ): [WorkspacePollActivityType]
  }

  extend type Mutation {
    # Coordinators only, like every poll change below unless noted.
    workspaceCreatePoll(
      committeeId: String!
      input: WorkspacePollInput!
    ): WorkspacePollType
    workspaceUpdatePoll(
      committeeId: String!
      pollId: String!
      input: WorkspacePollInput!
    ): WorkspacePollType
    # Adds members to an open poll's eligible voters.
    workspaceAddPollVoters(
      committeeId: String!
      pollId: String!
      voterIds: [String]!
    ): WorkspacePollType
    workspaceOpenPoll(
      committeeId: String!
      pollId: String!
      closesAt: String
    ): WorkspacePollType
    workspaceClosePoll(committeeId: String!, pollId: String!): WorkspacePollType
    workspaceReopenPoll(
      committeeId: String!
      pollId: String!
      closesAt: String!
    ): WorkspacePollType
    workspaceCancelPoll(
      committeeId: String!
      pollId: String!
      reason: String
    ): WorkspacePollType
    workspaceDeletePoll(committeeId: String!, pollId: String!): Boolean

    # Members vote for themselves.
    workspaceCastPollVote(
      committeeId: String!
      pollId: String!
      answers: [WorkspacePollAnswerInput]!
    ): WorkspacePollType
    workspaceWithdrawPollVote(
      committeeId: String!
      pollId: String!
    ): WorkspacePollType
  }
`;
