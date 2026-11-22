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
  attendanceGeofenceMeters: Int
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

# A karkun of a mehfil, and whether they already have a user account.
type OrgLocationKarkunType {
  _id: String!
  name: String
  parentName: String
  cnicNumber: String
  contactNumber1: String
  contactNumber2: String
  imageUrl: String
  imageThumbnailUrl: String
  hasUserAccount: Boolean!
}

type PagedOrgLocationKarkunType {
  data: [OrgLocationKarkunType!]!
  totalResults: Int!
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
  attendanceGeofenceMeters: Int
}

extend type Query {
  allOrgLocations: [OrgLocationType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  orgLocationById(_id: String!): OrgLocationType
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  # The karkuns of the mehfil.
  pagedOrgLocationKarkuns(
    locationId: String!
    name: String
    cnicNumber: String
    phoneNumber: String
    # Only the karkuns that have a user account.
    withUserAccount: Boolean
    pageIndex: String
    pageSize: String
  ): PagedOrgLocationKarkunType!
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  # The user accounts of the karkuns of the mehfil.
  pagedOrgLocationUsers(
    locationId: String!
    pageIndex: String
    pageSize: String
  ): PagedUserType
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  # Users that can be linked to a karkun: not service accounts, and with no
  # karkun linked. The search matches the user name, display name or email.
  pagedLinkableUsers(
    search: String
    pageIndex: String
    pageSize: String
  ): PagedUserType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

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

  # Links an existing user account to a karkun of the mehfil.
  linkOrgLocationUser(
    locationId: String!
    karkunId: String!
    userId: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  # Limited actions on the account of a karkun of the mehfil, for those who
  # manage the location. Not available for service accounts or super-admins.
  resetOrgLocationUserPassword(
    locationId: String!
    userId: String!
    password: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  setOrgLocationUserLocked(
    locationId: String!
    userId: String!
    locked: Boolean!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  createOrgLocationUserChatAccount(
    locationId: String!
    userId: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

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
