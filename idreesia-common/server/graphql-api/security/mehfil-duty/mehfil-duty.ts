import gql from 'graphql-tag';

export default gql`
type MehfilDutyType {	
  _id: String	
  name: String	
  urduName: String	
  overallUsedCount: Int	
  mehfilUsedCount: Int	

  createdAt: String	
  createdBy: String	
  updatedAt: String	
  updatedBy: String	
}	

extend type Query {	
  allSecurityMehfilDuties(mehfilId: String): [MehfilDutyType]	
    @checkPermissions(permissions: [SECURITY_VIEW_MEHFILS, SECURITY_MANAGE_MEHFILS, SECURITY_MANAGE_SETUP_DATA])	
  securityMehfilDutyById(id: String!): MehfilDutyType	
    @checkPermissions(permissions: [SECURITY_VIEW_MEHFILS, SECURITY_MANAGE_MEHFILS, SECURITY_MANAGE_SETUP_DATA])	
}	

extend type Mutation {	
  createSecurityMehfilDuty(name: String!, urduName: String!): MehfilDutyType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityMehfilDuty(id: String!, name: String!, urduName: String!): MehfilDutyType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityMehfilDuty(_id: String!): Int	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}`;
