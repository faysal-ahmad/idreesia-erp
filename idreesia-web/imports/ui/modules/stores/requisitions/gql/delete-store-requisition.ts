import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeleteStoreRequisitionMutation,
  DeleteStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const DELETE_STORE_REQUISITION: TypedDocumentNode<
  DeleteStoreRequisitionMutation,
  DeleteStoreRequisitionMutationVariables
> = gql`
  mutation deleteStoreRequisition($physicalStoreId: String!, $_id: String!) {
    deleteStoreRequisition(physicalStoreId: $physicalStoreId, _id: $_id)
  }
`;
