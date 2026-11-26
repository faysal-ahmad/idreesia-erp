import gql from 'graphql-tag';

// Org locations are owned by Admin. HR and the karkun lists read the city and
// mehfil locations to pick and show where a karkun belongs. The Permissions
// tabs read locations and their committees to give a committee a permission.
export default gql`
type ReferenceOrgLocationType {
  _id: String
  name: String
  type: String
  parentId: String
}

type ReferenceCommitteeType {
  _id: String!
  name: String!
  color: String
  # Members and coordinators: the people who hold its permissions.
  memberCount: Int!
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
      permissions: [
        HR_MANAGE_KARKUNS
        HR_MANAGE_EMPLOYEES
        HR_MANAGE_PERMISSIONS
        PURCHASING_MANAGE_PERMISSIONS
        SECURITY_MANAGE_PERMISSIONS
      ]
    )

  # The committees of a location, for giving one a module permission (on the
  # HR, Purchasing and Security Permissions tabs).
  referenceCommitteesByLocation(locationId: String!): [ReferenceCommitteeType]
    @checkPermissions(
      permissions: [
        HR_MANAGE_PERMISSIONS
        PURCHASING_MANAGE_PERMISSIONS
        SECURITY_MANAGE_PERMISSIONS
      ]
    )
}
`;
