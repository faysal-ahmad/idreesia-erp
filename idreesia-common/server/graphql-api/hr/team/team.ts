import gql from 'graphql-tag';

export default gql`
type TeamMemberScheduleType {
  karkunId: String
  daysOfWeek: [String]
}

type TeamType {
  _id: String
  name: String
  color: String
  description: String
  karkunIds: [String]
  coordinatorKarkunIds: [String]
  memberSchedules: [TeamMemberScheduleType]
  dutyId: String
  members: [PersonType]
  coordinators: [PersonType]
  duty: DutyType

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
  createTeam(name: String!, color: String, description: String, dutyId: String!, karkunIds: [String!], coordinatorKarkunIds: [String!]): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateTeam(id: String!, name: String!, color: String, description: String, dutyId: String!, karkunIds: [String!], coordinatorKarkunIds: [String!]): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeTeam(_id: String!): Int
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])

  addTeamMember(teamId: String!, karkunId: String!, daysOfWeek: [String!]!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  updateTeamMemberDays(teamId: String!, karkunId: String!, daysOfWeek: [String!]!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeTeamMember(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  addTeamCoordinator(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
  removeTeamCoordinator(teamId: String!, karkunId: String!): TeamType
    @checkPermissions(permissions: [HR_MANAGE_SETUP_DATA])
}`;
