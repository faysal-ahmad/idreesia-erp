import gql from 'graphql-tag';

export default gql`
type DutyLocationType {	
  _id: String	
  name: String	
  usedCount: Int	

  createdAt: String	
  createdBy: String	
  updatedAt: String	
  updatedBy: String	
}	

extend type Query {	
  allDutyLocations: [DutyLocationType]	
  dutyLocationById(id: String!): DutyLocationType	
}	

extend type Mutation {
  createDutyLocation(name: String!): DutyLocationType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateDutyLocation(id: String!, name: String!): DutyLocationType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeDutyLocation(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}`;
