import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ClosePurchasingRequisitionMutation,
  ClosePurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CLOSE_PURCHASING_REQUISITION: TypedDocumentNode<
  ClosePurchasingRequisitionMutation,
  ClosePurchasingRequisitionMutationVariables
> = gql`
  mutation closePurchasingRequisition($_id: String!) {
    closePurchasingRequisition(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default CLOSE_PURCHASING_REQUISITION;
