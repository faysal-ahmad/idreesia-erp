import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdateStoreRequisitionMutation,
  UpdateStoreRequisitionMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const UPDATE_STORE_REQUISITION: TypedDocumentNode<
  UpdateStoreRequisitionMutation,
  UpdateStoreRequisitionMutationVariables
> = gql`
  mutation updateStoreRequisition(
    $physicalStoreId: String!
    $_id: String!
    $version: Int!
    $title: String!
    $purpose: String
    $requestedBy: String
    $neededBy: String
    $lines: [PurchasingRequisitionLineInput!]!
  ) {
    updateStoreRequisition(
      physicalStoreId: $physicalStoreId
      _id: $_id
      version: $version
      title: $title
      purpose: $purpose
      requestedBy: $requestedBy
      neededBy: $neededBy
      lines: $lines
    ) {
      _id
      version
    }
  }
`;
