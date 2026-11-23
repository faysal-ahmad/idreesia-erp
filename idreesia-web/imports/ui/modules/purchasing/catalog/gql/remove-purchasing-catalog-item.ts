import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  RemovePurchasingCatalogItemMutation,
  RemovePurchasingCatalogItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const REMOVE_PURCHASING_CATALOG_ITEM: TypedDocumentNode<
  RemovePurchasingCatalogItemMutation,
  RemovePurchasingCatalogItemMutationVariables
> = gql`
  mutation removePurchasingCatalogItem($_id: String!) {
    removePurchasingCatalogItem(_id: $_id)
  }
`;

export default REMOVE_PURCHASING_CATALOG_ITEM;
