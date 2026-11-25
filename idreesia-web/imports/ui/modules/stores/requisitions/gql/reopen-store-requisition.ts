import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ReopenStoreRequisitionMutation,
  ReopenStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REOPEN_STORE_REQUISITION: TypedDocumentNode<
  ReopenStoreRequisitionMutation,
  ReopenStoreRequisitionMutationVariables
> = gql`
  mutation reopenStoreRequisition($physicalStoreId: String!, $_id: String!) {
    reopenStoreRequisition(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
    }
  }
`;
