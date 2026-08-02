import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchaseFormsMutation,
  RemovePurchaseFormsMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const REMOVE_PURCHASE_FORMS: TypedDocumentNode<
  RemovePurchaseFormsMutation,
  RemovePurchaseFormsMutationVariables
> = gql`
  mutation removePurchaseForms($physicalStoreId: String!, $_ids: [String]!) {
    removePurchaseForms(physicalStoreId: $physicalStoreId, _ids: $_ids)
  }
`;
