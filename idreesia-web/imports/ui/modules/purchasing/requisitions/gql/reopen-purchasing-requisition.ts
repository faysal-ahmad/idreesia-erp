import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ReopenPurchasingRequisitionMutation,
  ReopenPurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REOPEN_PURCHASING_REQUISITION: TypedDocumentNode<
  ReopenPurchasingRequisitionMutation,
  ReopenPurchasingRequisitionMutationVariables
> = gql`
  mutation reopenPurchasingRequisition($_id: String!) {
    reopenPurchasingRequisition(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default REOPEN_PURCHASING_REQUISITION;
