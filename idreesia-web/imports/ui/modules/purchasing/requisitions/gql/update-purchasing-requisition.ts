import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingRequisitionMutation,
  UpdatePurchasingRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_REQUISITION: TypedDocumentNode<
  UpdatePurchasingRequisitionMutation,
  UpdatePurchasingRequisitionMutationVariables
> = gql`
  mutation updatePurchasingRequisition($_id: String!, $version: Int!, $title: String!, $purpose: String, $requestedBy: String, $requestedFor: String, $neededBy: String, $lines: [PurchasingRequisitionLineInput!]!) {
    updatePurchasingRequisition(_id: $_id, version: $version, title: $title, purpose: $purpose, requestedBy: $requestedBy, requestedFor: $requestedFor, neededBy: $neededBy, lines: $lines) {
      _id
      version
    }
  }
`;

export default UPDATE_PURCHASING_REQUISITION;
