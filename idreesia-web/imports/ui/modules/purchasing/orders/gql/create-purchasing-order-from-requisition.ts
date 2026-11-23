import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingOrderFromRequisitionMutation,
  CreatePurchasingOrderFromRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_ORDER_FROM_REQUISITION: TypedDocumentNode<
  CreatePurchasingOrderFromRequisitionMutation,
  CreatePurchasingOrderFromRequisitionMutationVariables
> = gql`
  mutation createPurchasingOrderFromRequisition($requisitionId: String!, $vendorId: String!) {
    createPurchasingOrderFromRequisition(requisitionId: $requisitionId, vendorId: $vendorId) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_ORDER_FROM_REQUISITION;
