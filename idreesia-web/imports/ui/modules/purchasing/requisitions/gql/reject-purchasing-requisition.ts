import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RejectPurchasingRequisitionMutation,
  RejectPurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REJECT_PURCHASING_REQUISITION: TypedDocumentNode<
  RejectPurchasingRequisitionMutation,
  RejectPurchasingRequisitionMutationVariables
> = gql`
  mutation rejectPurchasingRequisition($_id: String!, $reason: String!) {
    rejectPurchasingRequisition(_id: $_id, reason: $reason) {
      _id
      status
      version
    }
  }
`;

export default REJECT_PURCHASING_REQUISITION;
