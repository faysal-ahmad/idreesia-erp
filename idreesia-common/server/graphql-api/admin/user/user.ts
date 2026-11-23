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
  # The user's id on the chat server, once a chat account is created.
  chatUserId: String
  twoFactorEnabled: Boolean
  isSuperAdmin: Boolean
  # A non-human account (an integration); it can never log in.
  isServiceAccount: Boolean
  # Addresses currently blocked from logging in after failed attempts.
  loginBlockedAddresses: Int
  # Too many failed attempts across addresses: only addresses the user has
  # logged in from before may try.
  untrustedLoginAddressesBlocked: Boolean

  person: PersonType
  karkun: PersonType
}

type TwoFactorSetupType {
  qrCodeSvg: String
  secret: String
  uri: String
}

# Why a user name / email can't be used for a new account (null: it can).
type UserAccountAvailabilityType {
  userNameMessage: String
  emailMessage: String
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
  # 'true': only service accounts; otherwise only regular users.
  serviceAccounts: String
  # Part of the user name or display name.
  name: String
  pageIndex: String
  pageSize: String
}

extend type Query {
  pagedUsers(filter: UserFilter): PagedUserType
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])

  userById(_id: String): UserType
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])

  # Whether the user name and email are free; checked while an account is made.
  userAccountAvailability(
    userName: String
    email: String
  ): UserAccountAvailabilityType!
    @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

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
    email: String
    displayName: String
    locked: Boolean
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # Sets a new password for the user. Only a super-admin may call it.
  resetUserPassword(userId: String!, password: String!): UserType
    @superAdminOnly

  # Creates a service account: a non-human account that can never log in.
  createServiceAccount(
    userName: String!
    displayName: String
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

  # Turns two-factor off for a user who lost their device. Super-admin only.
  resetTwoFactor(userId: String!): UserType @superAdminOnly

  # Lifts the blocks failed login attempts put on the user's account.
  clearLoginBlocks(
    userId: String!
  ): UserType @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])

  # Grants or revokes super-admin rights. Not a permission: every permission
  # check lets a super-admin through, so only a super-admin may call it.
  setSuperAdmin(userId: String!, isSuperAdmin: Boolean!): UserType
    @superAdminOnly

  updateLoginTime: Int
  updateLastActiveTime: Int
}
`;
