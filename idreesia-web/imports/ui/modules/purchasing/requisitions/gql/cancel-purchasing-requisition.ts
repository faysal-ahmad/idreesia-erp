import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CancelPurchasingRequisitionMutation,
  CancelPurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CANCEL_PURCHASING_REQUISITION: TypedDocumentNode<
  CancelPurchasingRequisitionMutation,
  CancelPurchasingRequisitionMutationVariables
> = gql`
  mutation cancelPurchasingRequisition($_id: String!) {
    cancelPurchasingRequisition(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default CANCEL_PURCHASING_REQUISITION;
