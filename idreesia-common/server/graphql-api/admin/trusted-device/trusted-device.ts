import gql from 'graphql-tag';

export default gql`
type TrustedDeviceType {
  _id: String
  name: String
  createdAt: String
  lastUsedAt: String
  expiresAt: String
}

type EnrolledTrustedDeviceType {
  deviceId: String!
  # Shown once. The app keeps it in secure storage.
  deviceSecret: String!
}

extend type Query {
  # The caller's own trusted (PIN login) devices.
  myTrustedDevices: [TrustedDeviceType]

  userTrustedDevices(
    userId: String!
  ): [TrustedDeviceType]
    @checkPermissions(permissions: [ADMIN_VIEW_USERS_AND_GROUPS, ADMIN_MANAGE_USERS_AND_GROUPS])
}

extend type Mutation {
  # Trusts the caller's device for PIN login. Passing replaceDeviceId swaps an
  # earlier enrollment of the same device out (changing the PIN). A user with
  # two-factor on must also pass a fresh code.
  enrollTrustedDevice(
    pin: String!
    name: String
    code: String
    replaceDeviceId: String
  ): EnrolledTrustedDeviceType

  # The caller stops trusting one of their devices.
  removeTrustedDevice(deviceId: String!): Boolean

  # Stops trusting every device of the user; returns how many were revoked.
  revokeUserTrustedDevices(
    userId: String!
  ): Int @checkPermissions(permissions: [ADMIN_MANAGE_USERS_AND_GROUPS])
}
`;
