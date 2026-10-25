import gql from 'graphql-tag';

export default gql`
type SecurityServerChannelType {
  _id: String
  externalId: String
  name: String
  enabled: Boolean
  similarityThreshold: Float
  recognitionFps: Float

  alertsCount: Int

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
  deletedAt: String
}

extend type Query {
  allSecurityServerChannels(includeDeleted: Boolean): [SecurityServerChannelType]
  @checkPermissions(permissions: [SECURITY_VIEW_SECURITY_SERVER_DATA])
}
`;
