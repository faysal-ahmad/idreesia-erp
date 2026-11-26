import gql from 'graphql-tag';

export default gql`
type SecurityEventType {
  _id: String
  name: String
  eventDate: String

  karkunCount: Int
  eventKarkuns: SecurityEventKarkunType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allSecurityEvents: [SecurityEventType]
  @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS])

  securityEventById(_id: String!): SecurityEventType
  @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS])
}

extend type Mutation {
  createSecurityEvent(name: String!, eventDate: String!): SecurityEventType
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityEvent(_id: String!, name: String!, eventDate: String): SecurityEventType
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityEvent(_id: String!): Int
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}
`;
