import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingRequisitionMutation,
  CreatePurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_REQUISITION: TypedDocumentNode<
  CreatePurchasingRequisitionMutation,
  CreatePurchasingRequisitionMutationVariables
> = gql`
  mutation createPurchasingRequisition($title: String!, $purpose: String, $requestedBy: String, $neededBy: String, $lines: [PurchasingRequisitionLineInput!]!) {
    createPurchasingRequisition(title: $title, purpose: $purpose, requestedBy: $requestedBy, neededBy: $neededBy, lines: $lines) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_REQUISITION;
