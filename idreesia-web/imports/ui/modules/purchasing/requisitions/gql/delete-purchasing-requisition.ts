import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  DeletePurchasingRequisitionMutation,
  DeletePurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const DELETE_PURCHASING_REQUISITION: TypedDocumentNode<
  DeletePurchasingRequisitionMutation,
  DeletePurchasingRequisitionMutationVariables
> = gql`
  mutation deletePurchasingRequisition($_id: String!) {
    deletePurchasingRequisition(_id: $_id)
  }
`;

export default DELETE_PURCHASING_REQUISITION;
