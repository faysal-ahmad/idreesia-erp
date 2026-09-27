import gql from 'graphql-tag';

export default gql`
type TeamType {
  _id: String
  name: String
  color: String
  description: String
  karkunIds: [String]
  coordinatorKarkunId: String
  members: [PersonType]
  coordinator: PersonType

  createdAt: String
  createdBy: String
  updatedAt: String
  updatedBy: String
}

extend type Query {
  allTeams: [TeamType]
  teamById(id: String!): TeamType
}

extend type Mutation {
  createTeam(name: String!, color: String, description: String, karkunIds: [String!], coordinatorKarkunId: String): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateTeam(id: String!, name: String!, color: String, description: String, karkunIds: [String!], coordinatorKarkunId: String): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeTeam(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])

  addTeamMember(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeTeamMember(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  setTeamCoordinator(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}`;
