import gql from 'graphql-tag';

// What a user of a mehfil's details may do (MehfilDetailsPermissions).
export default gql`
enum MehfilDetailsPermission {
  VIEW
  UPDATE
}

directive @checkMehfilDetailsAccess(
  permission: MehfilDetailsPermission!,
  locationIdArgName: String,
) on FIELD_DEFINITION`;
