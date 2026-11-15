import gql from 'graphql-tag';

export default gql`
type UserType {
  _id: String
  username: String
  email: String
  emailVerified: Boolean

  personId: String
  displayName: String
  locked: Boolean
  lastLoggedInAt: String
  lastActiveAt: String
  permissions: [String]
  instances: [String]
  groups: [String]
  hasChatAccount: Boolean
  twoFactorEnabled: Boolean
  isSuperAdmin: Boolean

  person: PersonType
  karkun: PersonType
}

type TwoFactorSetupType {
  qrCodeSvg: String
  secret: String
  uri: String
}

type PagedUserType {
  totalResults: Int
  data: [UserType]
}

input UserFilter {
  showLocked: String
  showUnlocked: String
  showActive: String
  showInactive: String
  moduleAccess: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedUsers(filter: UserFilter): PagedUserType
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])

  userById(_id: String): UserType
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])

  currentUser: UserType
  userNames(ids: [String]): [String]
}

extend type Mutation {
  registerUser(displayName: String!, email: String!): Int

  createUser(
    userName: String
    password: String
    email: String
    displayName: String
    personId: String
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  updateUser(
    userId: String!
    userName: String
    password: String
    email: String
    displayName: String
    locked: Boolean
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  setPermissions(
    userId: String!
    permissions: [String]!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  setInstanceAccess(
    userId: String!
    instances: [String]!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  createChatAccount(
    userId: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # Two-factor authentication for the logged-in user's own account.
  startTwoFactorSetup: TwoFactorSetupType
  enableTwoFactor(code: String!): UserType
  disableTwoFactor(code: String!): UserType

  resetTwoFactor(
    userId: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # Grants or revokes super-admin rights. No permission directive: every
  # permission check lets a super-admin through, so the resolver itself
  # requires the caller to be a super-admin.
  setSuperAdmin(userId: String!, isSuperAdmin: Boolean!): UserType

  updateLoginTime: Int
  updateLastActiveTime: Int
}
`;
