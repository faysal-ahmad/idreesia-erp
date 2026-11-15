import gql from 'graphql-tag';

// The roles a person can hold on a committee (CommitteeMemberRoles).
export default gql`
enum CommitteeRole {
  MEMBER
  COORDINATOR
  GUEST
  OBSERVER
}

directive @checkCommitteeAccess(
  roles: [CommitteeRole!]!,
  committeeIdArgName: String,
) on FIELD_DEFINITION`;
