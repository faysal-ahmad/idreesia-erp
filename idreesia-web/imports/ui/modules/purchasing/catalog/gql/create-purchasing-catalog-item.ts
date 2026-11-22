import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  CreatePurchasingCatalogItemMutation,
  CreatePurchasingCatalogItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const CREATE_PURCHASING_CATALOG_ITEM: TypedDocumentNode<
  CreatePurchasingCatalogItemMutation,
  CreatePurchasingCatalogItemMutationVariables
> = gql`
  mutation createPurchasingCatalogItem($name: String!, $unit: String!, $category: String, $description: String, $defaultUnitPrice: Float) {
    createPurchasingCatalogItem(name: $name, unit: $unit, category: $category, description: $description, defaultUnitPrice: $defaultUnitPrice) {
      _id
    }
  }
`;

export default CREATE_PURCHASING_CATALOG_ITEM;
