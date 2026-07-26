// @ts-nocheck
import gql from 'graphql-tag';

export default gql`
directive @checkInstanceAccess(
  instanceIdArgName: String!,
  returnType: String,
  dataFieldName: String,
) on FIELD_DEFINITION`;
