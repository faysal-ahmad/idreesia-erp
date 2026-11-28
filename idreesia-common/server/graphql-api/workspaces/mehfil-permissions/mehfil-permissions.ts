import gql from 'graphql-tag';

// Every operation names the mehfil it works on and declares the permission it
// needs with @checkMehfilPermissionsAccess. A super-admin holds every
// permission.
export default gql`
# A mehfil whose permissions the caller can open, or one of its ancestors
# (hasWorkspace false), listed so the locations show in their hierarchy.
type MyMehfilPermissionsLocationType {
  locationId: String!
  name: String!
  type: String!
  parentId: String
  hasWorkspace: Boolean!
  permissions: [String!]!
}

type MpUserType {
  userId: String!
  # The karkun the user account belongs to.
  personId: String
  username: String
  displayName: String
}

type MpPermissionType {
  key: String!
  name: String!
  description: String!
  users: [MpUserType]!
}

# A permission group of the mehfil (General or a feature).
type MpGroupType {
  featureKey: String!
  featureName: String!
  permissions: [MpPermissionType]!
}

type MehfilPermissionsType {
  locationId: String!
  # What the caller may do here.
  permissions: [String!]!
  groups: [MpGroupType]!
}

extend type Query {
  myMehfilPermissionsLocations: [MyMehfilPermissionsLocationType]!

  workspaceMehfilPermissions(locationId: String!): MehfilPermissionsType
    @checkMehfilPermissionsAccess(permission: VIEW)

  # Karkuns to choose from when giving a permission.
  pagedWorkspaceMehfilPermissionsKarkuns(
    locationId: String!
    name: String
    cnicNumber: String
    phoneNumber: String
    pageIndex: String
    pageSize: String
  ): PagedPickerPersonType @checkMehfilPermissionsAccess(permission: MANAGE)
}

extend type Mutation {
  workspaceAddMehfilPermissionUser(
    locationId: String!
    featureKey: String!
    permissionKey: String!
    karkunId: String!
  ): Boolean @checkMehfilPermissionsAccess(permission: MANAGE)

  workspaceRemoveMehfilPermissionUser(
    locationId: String!
    featureKey: String!
    permissionKey: String!
    userId: String!
  ): Boolean @checkMehfilPermissionsAccess(permission: MANAGE)
}
`;
