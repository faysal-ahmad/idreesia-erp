import gql from 'graphql-tag';

export default gql`
type CommitteeMemberType {
  karkunId: String
  isCoordinator: Boolean
  karkun: PersonType
}

type CommitteeType {
  _id: String
  name: String
  color: String
  description: String
  members: [CommitteeMemberType]

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allCommittees: [CommitteeType]
  committeeById(id: String!): CommitteeType
}

extend type Mutation {
  createCommittee(name: String!, color: String, description: String): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateCommittee(id: String!, name: String!, color: String, description: String): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeCommittee(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])

  addCommitteeMember(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeCommitteeMember(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  addCommitteeCoordinator(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeCommitteeCoordinator(committeeId: String!, karkunId: String!): CommitteeType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}`;
