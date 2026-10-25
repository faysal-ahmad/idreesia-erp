import gql from 'graphql-tag';

export default gql`
  type SecurityServerChannelConnectionType {
    host: String
    port: Int
    path: String
    username: String
    # The password itself is never returned - only whether one is stored.
    hasPassword: Boolean
  }

  type SecurityServerChannelType {
    _id: String
    name: String
    enabled: Boolean
    similarityThreshold: Float
    recognitionFps: Float
    connection: SecurityServerChannelConnectionType

    alertsCount: Int

    createdAt: String
    createdBy: String
    updatedAt: String
    updatedBy: String
    deletedAt: String
  }

  input SecurityServerChannelConnectionInput {
    host: String!
    port: Int
    path: String
    username: String
    # Leave empty on update to keep the stored password.
    password: String
  }

  extend type Query {
    allSecurityServerChannels(
      includeDeleted: Boolean
    ): [SecurityServerChannelType]
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])

    securityServerChannelById(_id: String!): SecurityServerChannelType
      @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
  }

  extend type Mutation {
    createSecurityServerChannel(
      name: String!
      enabled: Boolean!
      similarityThreshold: Float
      recognitionFps: Float!
      connection: SecurityServerChannelConnectionInput!
    ): SecurityServerChannelType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    updateSecurityServerChannel(
      _id: String!
      name: String!
      enabled: Boolean!
      similarityThreshold: Float
      recognitionFps: Float!
      connection: SecurityServerChannelConnectionInput!
    ): SecurityServerChannelType
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])

    deleteSecurityServerChannel(_id: String!): Int
      @checkPermissions(permissions: [SECURITY_MANAGE_SECURITY_SERVER_DATA])
  }
`;
