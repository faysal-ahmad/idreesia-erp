import gql from 'graphql-tag';

export default gql`
directive @checkPermissions(
  permissions: [Permission!],
  # Store permissions that also let the caller in when they hold one of them on
  # any store (for fields that are not about one particular store).
  anyStorePermissions: [Permission!],
  dataFieldName: String,
) on FIELD_DEFINITION`;
