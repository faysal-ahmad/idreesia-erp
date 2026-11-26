import gql from 'graphql-tag';

export default gql`
type SecurityEventLangarLocationType {	
  _id: String	
  name: String	
  urduName: String	
  overallUsedCount: Int	

  createdAt: String	
  createdBy: String	
  updatedAt: String	
  updatedBy: String	
}	

extend type Query {	
  allSecurityEventLangarLocations: [SecurityEventLangarLocationType]	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
  securityEventLangarLocationById(id: String!): SecurityEventLangarLocationType	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
}	

extend type Mutation {	
  createSecurityEventLangarLocation(name: String!, urduName: String!): SecurityEventLangarLocationType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityEventLangarLocation(id: String!, name: String!, urduName: String!): SecurityEventLangarLocationType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityEventLangarLocation(_id: String!): Int	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}`;
