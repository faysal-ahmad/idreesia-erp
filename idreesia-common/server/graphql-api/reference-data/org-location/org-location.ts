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

  # Locations for a location picker: those of the given types (all when
  # empty) plus their ancestors, so the tree shows where they sit.
  referenceOrgLocations(types: [String!]): [ReferenceOrgLocationType]
    @checkPermissions(
      permissions: [HR_MANAGE_KARKUNS, HR_MANAGE_EMPLOYEES]
    )
}
`;
