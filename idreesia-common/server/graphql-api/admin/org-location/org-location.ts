import gql from 'graphql-tag';

export default gql`
type OrgLocationMehfilDetailsType {
  address: String
  mehfilStartYear: String
  timingDetails: String
  lcdAvailability: Boolean
  tabAvailability: Boolean
  otherMehfilDetails: String
  latitude: Float
  longitude: Float
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
  # Per observer: how many committees below this location they observe.
  observerStats: [OrgLocationObserverStatType]

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

type OrgLocationObserverStatType {
  karkunId: String
  observedCommitteeCount: Int
  observedCommitteeIds: [String]
}

type SyncOrgLocationObserversResult {
  committeesChecked: Int
  addedCount: Int
  removedCount: Int
}

# A user holding a permission of a location feature.
type OrgLocationFeaturePermissionUserType {
  userId: String!
  # The karkun the user account belongs to.
  personId: String
  username: String
  displayName: String
}

# A permission a feature supports, with the users holding it.
type OrgLocationFeaturePermissionType {
  key: String!
  name: String!
  description: String!
  users: [OrgLocationFeaturePermissionUserType]!
}

# A permission group of a location (General or a feature), with its permissions.
type OrgLocationFeaturePermissionsType {
  featureKey: String!
  featureName: String!
  permissions: [OrgLocationFeaturePermissionType]!
}

input OrgLocationMehfilDetailsInput {
  address: String
  mehfilStartYear: String
  timingDetails: String
  lcdAvailability: Boolean
  tabAvailability: Boolean
  otherMehfilDetails: String
  latitude: Float
  longitude: Float
}

extend type Query {
  allOrgLocations: [OrgLocationType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  orgLocationById(_id: String!): OrgLocationType
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  # The location's permission groups (General, and for a mehfil each feature),
  # with the users holding each permission.
  orgLocationFeaturePermissions(
    locationId: String!
  ): [OrgLocationFeaturePermissionsType]
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

  # Makes the location's observers, and those of its ancestors, inherited
  # observers of every committee in the location and the locations below it.
  # Inherited observers that no longer apply are removed.
  syncOrgLocationObservers(locationId: String!): SyncOrgLocationObserversResult
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  addOrgLocationFeatureUser(
    locationId: String!
    featureKey: String!
    permissionKey: String!
    karkunId: String!
  ): Boolean @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  removeOrgLocationFeatureUser(
    locationId: String!
    featureKey: String!
    permissionKey: String!
    userId: String!
  ): Boolean @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])
}
`;
