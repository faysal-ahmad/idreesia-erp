import gql from 'graphql-tag';

// What a user of a mehfil's permissions may do (MehfilPermissionsPermissions).
export default gql`
enum MehfilPermissionsPermission {
  VIEW
  MANAGE
}

directive @checkMehfilPermissionsAccess(
  permission: MehfilPermissionsPermission!,
  locationIdArgName: String,
) on FIELD_DEFINITION`;
