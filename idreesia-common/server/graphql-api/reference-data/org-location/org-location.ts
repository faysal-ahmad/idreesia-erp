import gql from 'graphql-tag';

// Org locations are owned by Admin. HR and the karkun lists read the city and
// mehfil locations to pick and show where a karkun belongs.
export default gql`
type ReferenceOrgLocationType {
  _id: String
  name: String
  type: String
  parentId: String
}

extend type Query {
  referenceCityMehfilLocations: [ReferenceOrgLocationType]
    @checkPermissions(
      permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_EMPLOYEES]
    )
}
`;
