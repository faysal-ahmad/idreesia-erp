import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CancelStoreRequisitionMutation,
  CancelStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CANCEL_STORE_REQUISITION: TypedDocumentNode<
  CancelStoreRequisitionMutation,
  CancelStoreRequisitionMutationVariables
> = gql`
  mutation cancelStoreRequisition($physicalStoreId: String!, $_id: String!) {
    cancelStoreRequisition(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
    }
  }
`;
