import gql from 'graphql-tag';

// What a user of a mehfil's karkuns may do (MehfilKarkunsPermissions).
export default gql`
enum MehfilKarkunsPermission {
  VIEW
}

directive @checkMehfilKarkunsAccess(
  permission: MehfilKarkunsPermission!,
  locationIdArgName: String,
) on FIELD_DEFINITION`;
