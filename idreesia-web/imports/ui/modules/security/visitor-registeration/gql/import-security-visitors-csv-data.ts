import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ImportSecurityVisitorsCsvDataMutation,
  ImportSecurityVisitorsCsvDataMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const IMPORT_SECURITY_VISITORS_CSV_DATA: TypedDocumentNode<
  ImportSecurityVisitorsCsvDataMutation,
  ImportSecurityVisitorsCsvDataMutationVariables
> = gql`
  mutation importSecurityVisitorsCsvData($csvData: String!) {
    importSecurityVisitorsCsvData(csvData: $csvData)
  }
`;

export default IMPORT_SECURITY_VISITORS_CSV_DATA;
