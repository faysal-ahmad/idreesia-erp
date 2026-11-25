import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SubmitStoreRequisitionMutation,
  SubmitStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const SUBMIT_STORE_REQUISITION: TypedDocumentNode<
  SubmitStoreRequisitionMutation,
  SubmitStoreRequisitionMutationVariables
> = gql`
  mutation submitStoreRequisition($physicalStoreId: String!, $_id: String!) {
    submitStoreRequisition(physicalStoreId: $physicalStoreId, _id: $_id) {
      _id
    }
  }
`;
