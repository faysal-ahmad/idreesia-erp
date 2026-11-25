import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreateStoreRequisitionMutation,
  CreateStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const CREATE_STORE_REQUISITION: TypedDocumentNode<
  CreateStoreRequisitionMutation,
  CreateStoreRequisitionMutationVariables
> = gql`
  mutation createStoreRequisition(
    $physicalStoreId: String!
    $title: String!
    $purpose: String
    $requestedBy: String
    $neededBy: String
    $lines: [PurchasingRequisitionLineInput!]!
  ) {
    createStoreRequisition(
      physicalStoreId: $physicalStoreId
      title: $title
      purpose: $purpose
      requestedBy: $requestedBy
      neededBy: $neededBy
      lines: $lines
    ) {
      _id
    }
  }
`;
