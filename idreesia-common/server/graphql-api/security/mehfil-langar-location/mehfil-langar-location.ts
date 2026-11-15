import gql from 'graphql-tag';

export default gql`
type MehfilLangarLocationType {	
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
  allSecurityMehfilLangarLocations: [MehfilLangarLocationType]	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
  securityMehfilLangarLocationById(id: String!): MehfilLangarLocationType	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
}	

extend type Mutation {	
  createSecurityMehfilLangarLocation(name: String!, urduName: String!): MehfilLangarLocationType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityMehfilLangarLocation(id: String!, name: String!, urduName: String!): MehfilLangarLocationType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityMehfilLangarLocation(_id: String!): Int	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}`;
