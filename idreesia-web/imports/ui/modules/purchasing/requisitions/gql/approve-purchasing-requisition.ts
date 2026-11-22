import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  ApprovePurchasingRequisitionMutation,
  ApprovePurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const APPROVE_PURCHASING_REQUISITION: TypedDocumentNode<
  ApprovePurchasingRequisitionMutation,
  ApprovePurchasingRequisitionMutationVariables
> = gql`
  mutation approvePurchasingRequisition($_id: String!) {
    approvePurchasingRequisition(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default APPROVE_PURCHASING_REQUISITION;
