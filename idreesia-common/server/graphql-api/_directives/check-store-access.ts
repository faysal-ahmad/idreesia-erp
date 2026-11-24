import gql from 'graphql-tag';

// A store permission, held by the caller on the store named by the field's
// store id argument. Replaces @checkPermissions + @checkInstanceAccess for the
// Stores module: the caller must hold at least one of the permissions on that
// store (see PhysicalStoreAccess).
export default gql`
directive @checkStoreAccess(
  permissions: [Permission]!,
  physicalStoreIdArgName: String!,
  returnType: String,
  dataFieldName: String,
) on FIELD_DEFINITION`;
