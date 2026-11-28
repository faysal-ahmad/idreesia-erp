import gql from 'graphql-tag';

export default gql`
type SecurityEventDutyType {	
  _id: String	
  name: String	
  urduName: String	
  overallUsedCount: Int	
  eventUsedCount: Int	

  createdAt: String	
  createdBy: String	
  updatedAt: String	
  updatedBy: String	
}	

extend type Query {	
  allSecurityEventDuties(eventId: String): [SecurityEventDutyType]	
    @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS, SECURITY_MANAGE_SETUP_DATA])	
  securityEventDutyById(id: String!): SecurityEventDutyType	
    @checkPermissions(permissions: [SECURITY_VIEW_EVENTS, SECURITY_MANAGE_EVENTS, SECURITY_MANAGE_SETUP_DATA])	
}	

extend type Mutation {	
  createSecurityEventDuty(name: String!, urduName: String!): SecurityEventDutyType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  updateSecurityEventDuty(id: String!, name: String!, urduName: String!): SecurityEventDutyType	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])

  removeSecurityEventDuty(_id: String!): Int	
  @checkPermissions(permissions: [SECURITY_MANAGE_SETUP_DATA])
}`;
