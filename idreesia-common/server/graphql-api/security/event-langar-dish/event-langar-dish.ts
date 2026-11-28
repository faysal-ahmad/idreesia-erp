import gql from 'graphql-tag';

export default gql`
type SecurityEventLangarDishType {	
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
  allSecurityEventLangarDishes: [SecurityEventLangarDishType]	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
  securityEventLangarDishById(id: String!): SecurityEventLangarDishType	
    @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])	
}	

extend type Mutation {	
  createSecurityEventLangarDish(name: String!, urduName: String!): SecurityEventLangarDishType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityEventLangarDish(id: String!, name: String!, urduName: String!): SecurityEventLangarDishType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityEventLangarDish(_id: String!): Int	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}`;
