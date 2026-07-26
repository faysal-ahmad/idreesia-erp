// @ts-nocheck
import gql from 'graphql-tag';

export default gql`
directive @checkPermissions(
  permissions: [Permission!],
  dataFieldName: String,
) on FIELD_DEFINITION`;
