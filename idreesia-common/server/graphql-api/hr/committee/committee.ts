import gql from 'graphql-tag';

export default gql`
type CommitteeMemberType {
  karkunId: String
  isCoordinator: Boolean
  karkun: PersonType
  # The person has an ERP user.
  hasLoginAccount: Boolean
  # That user has a chat account.
  hasChatAccount: Boolean
  # That chat account is in the committee's discussion group. Null when
  # Discussions is not enabled (or chat could not be reached).
  hasDiscussionAccess: Boolean
}

type CommitteeFeatureType {
  key: String
  name: String
  description: String
  category: String
}

type CommitteeType {
  _id: String
  name: String
  color: String
  description: String
  members: [CommitteeMemberType]
  features: [String]

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allCommittees: [CommitteeType]
    @checkPermissions(permissions: [HR_VIEW_COMMITTEES, HR_MANAGE_COMMITTEES])
  committeeById(id: String!): CommitteeType
    @checkPermissions(permissions: [HR_VIEW_COMMITTEES, HR_MANAGE_COMMITTEES])
  allCommitteeFeatures: [CommitteeFeatureType]
    @checkPermissions(permissions: [HR_VIEW_COMMITTEES, HR_MANAGE_COMMITTEES])
}

extend type Mutation {
  createCommittee(name: String!, color: String, description: String): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  updateCommittee(id: String!, name: String!, color: String, description: String): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  removeCommittee(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])

  addCommitteeMember(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  removeCommitteeMember(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  addCommitteeCoordinator(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  removeCommitteeCoordinator(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])

  enableCommitteeFeature(committeeId: String!, featureKey: String!): Boolean!
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  disableCommitteeFeature(committeeId: String!, featureKey: String!): Boolean!
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
  setCommitteeMemberDiscussionAccess(
    committeeId: String!
    karkunId: String!
    hasAccess: Boolean!
  ): Boolean
    @checkPermissions(permissions: [HR_MANAGE_COMMITTEES])
}`;
