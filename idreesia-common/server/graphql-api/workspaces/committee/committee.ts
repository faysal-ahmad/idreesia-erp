import gql from 'graphql-tag';

// GraphQL operations used by the Workspaces module. Access is based on
// committee membership (erp-admin sees everything), not on permissions.
export default gql`
type WorkspaceCommitteeMemberType {
  karkunId: String
  isCoordinator: Boolean
  name: String
  imageUrl: String
  imageThumbnailUrl: String
  contactNumber1: String
  contactNumber2: String
  # The person has an ERP user.
  hasLoginAccount: Boolean
  # That user has a chat account.
  hasChatAccount: Boolean
  # That chat account is in the committee's discussion group. Null when
  # Discussions is not enabled (or chat could not be reached).
  hasDiscussionAccess: Boolean
}

type WorkspaceCommitteeType {
  _id: String
  name: String
  color: String
  description: String
  # True when the logged-in user can manage this committee's members.
  canManageMembers: Boolean
  # Keys of the features enabled for this committee (e.g. 'discussions').
  features: [String]
  members: [WorkspaceCommitteeMemberType]
}

type WorkspaceKarkunType {
  _id: String
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  imageUrl: String
  imageThumbnailUrl: String
}

type PagedWorkspaceKarkunType {
  data: [WorkspaceKarkunType]
  totalResults: Int
}

extend type Query {
  # Committees the logged-in user is currently a member of.
  myCommittees: [WorkspaceCommitteeType]

  # A committee the logged-in user is a member of; null otherwise.
  workspaceCommitteeById(committeeId: String!): WorkspaceCommitteeType

  # Karkuns that a coordinator can add to their committee.
  workspaceCommitteeKarkunSearch(
    committeeId: String!
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedWorkspaceKarkunType
}

extend type Mutation {
  workspaceAddCommitteeMember(
    committeeId: String!
    karkunId: String!
  ): WorkspaceCommitteeType
  workspaceRemoveCommitteeMember(
    committeeId: String!
    karkunId: String!
  ): WorkspaceCommitteeType
  # Adds a member's chat account to the committee's discussion group, or
  # removes it. The member must have a chat account.
  workspaceSetCommitteeMemberDiscussionAccess(
    committeeId: String!
    karkunId: String!
    hasAccess: Boolean!
  ): Boolean
}`;
