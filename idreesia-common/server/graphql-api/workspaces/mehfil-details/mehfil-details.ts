import gql from 'graphql-tag';

// Every operation names the mehfil it works on and declares the permission it
// needs with @checkMehfilDetailsAccess. A super-admin holds every permission.
export default gql`
type MehfilDetailsAccessType {
  locationId: String!
  permissions: [String!]!
}

# A mehfil whose details the caller can open, or one of its ancestors
# (hasWorkspace false), listed so the locations show in their hierarchy.
type MyMehfilDetailsLocationType {
  locationId: String!
  name: String!
  type: String!
  parentId: String
  hasWorkspace: Boolean!
  permissions: [String!]!
}

type WorkspaceMehfilDetailsType {
  locationId: String!
  name: String!
  mehfilDetails: OrgLocationMehfilDetailsType
  # What the caller may do with the details.
  permissions: [String!]!
}

extend type Query {
  myMehfilDetailsLocations: [MyMehfilDetailsLocationType]!

  workspaceMehfilDetails(locationId: String!): WorkspaceMehfilDetailsType
    @checkMehfilDetailsAccess(permission: VIEW)
}

extend type Mutation {
  workspaceUpdateMehfilDetails(
    locationId: String!
    mehfilDetails: OrgLocationMehfilDetailsInput!
  ): WorkspaceMehfilDetailsType
    @checkMehfilDetailsAccess(permission: UPDATE)
}
`;
