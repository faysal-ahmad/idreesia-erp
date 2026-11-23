import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  SubmitPurchasingRequisitionMutation,
  SubmitPurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const SUBMIT_PURCHASING_REQUISITION: TypedDocumentNode<
  SubmitPurchasingRequisitionMutation,
  SubmitPurchasingRequisitionMutationVariables
> = gql`
  mutation submitPurchasingRequisition($_id: String!) {
    submitPurchasingRequisition(_id: $_id) {
      _id
      status
      version
    }
  }
`;

export default SUBMIT_PURCHASING_REQUISITION;
