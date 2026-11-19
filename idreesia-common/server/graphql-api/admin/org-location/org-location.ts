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
  # Per observer: how many committees below this location they observe.
  observerStats: [OrgLocationObserverStatType]
  # Features enabled on this location (mehfils only).
  features: [String]

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

type OrgLocationFeatureType {
  key: String!
  name: String!
  description: String!
}

type DutiesAttendancePermissionInfoType {
  key: String!
  name: String!
  description: String!
}

# A user of the location's Duties and Attendance workspace.
type OrgLocationDutiesAttendanceUserType {
  _id: String!
  userId: String!
  username: String
  displayName: String
  permissions: [String]!
}

# A user that can be added to a workspace.
type DutiesAttendanceUserCandidateType {
  _id: String!
  username: String
  displayName: String
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

  allOrgLocationFeatures: [OrgLocationFeatureType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  allDutiesAttendancePermissions: [DutiesAttendancePermissionInfoType]
    @checkPermissions(permissions: [ADMIN_VIEW_ORG_LOCATIONS])

  # Unlocked users matching the text, to add to a workspace.
  dutiesAttendanceUserCandidates(
    search: String
  ): [DutiesAttendanceUserCandidateType]
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  orgLocationDutiesAttendanceUsers(
    locationId: String!
  ): [OrgLocationDutiesAttendanceUserType]
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

  enableOrgLocationFeature(locationId: String!, featureKey: String!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  disableOrgLocationFeature(locationId: String!, featureKey: String!): Boolean
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  addOrgLocationDutiesAttendanceUser(
    locationId: String!
    userId: String!
    permissions: [String]!
  ): OrgLocationDutiesAttendanceUserType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  updateOrgLocationDutiesAttendanceUserPermissions(
    locationId: String!
    userId: String!
    permissions: [String]!
  ): OrgLocationDutiesAttendanceUserType
    @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])

  removeOrgLocationDutiesAttendanceUser(
    locationId: String!
    userId: String!
  ): Boolean @checkPermissions(permissions: [ADMIN_MANAGE_ORG_LOCATIONS])
}
`;
