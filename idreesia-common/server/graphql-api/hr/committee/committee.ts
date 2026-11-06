import gql from 'graphql-tag';

export default gql`
type CommitteeMemberType {
  karkunId: String
  isCoordinator: Boolean
  karkun: PersonType
}

type CommitteeFeatureType {
  key: String
  name: String
  description: String
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
}`;
