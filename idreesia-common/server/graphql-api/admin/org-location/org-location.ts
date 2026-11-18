import gql from 'graphql-tag';

export default gql`
type OrgLocationMehfilDetailsType {
  address: String
  mehfilStartYear: String
  timingDetails: String
  lcdAvailability: Boolean
  tabAvailability: Boolean
  otherMehfilDetails: String
}

type OrgLocationType {
  _id: String
  name: String
  type: String
  parentId: String
  allParentIds: [String]
  mehfilDetails: OrgLocationMehfilDetailsType
  parent: OrgLocationType
  # The committees made under this location.
  committees: [CommitteeBasicType]
  # Karkuns observing this location.
  observerKarkunIds: [String]
  observers: [PersonType]

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

input OrgLocationMehfilDetailsInput {
  address: String
  mehfilStartYear: String
  timingDetails: String
  lcdAvailability: Boolean
  tabAvailability: Boolean
  otherMehfilDetails: String
}

extend type Query {
  allOrgLocations: [OrgLocationType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  orgLocationById(_id: String!): OrgLocationType
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])
}

extend type Mutation {
  createOrgLocation(
    name: String!
    type: String!
    parentId: String
    mehfilDetails: OrgLocationMehfilDetailsInput
  ): OrgLocationType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  updateOrgLocation(
    _id: String!
    name: String!
    parentId: String
    mehfilDetails: OrgLocationMehfilDetailsInput
  ): OrgLocationType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  addOrgLocationObserver(locationId: String!, karkunId: String!): OrgLocationType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  removeOrgLocationObserver(locationId: String!, karkunId: String!): OrgLocationType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])
}
`;
