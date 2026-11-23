import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  UpdatePurchasingCatalogItemMutation,
  UpdatePurchasingCatalogItemMutationVariables,
} from 'meteor/idreesia-common/types/client-operations';

const UPDATE_PURCHASING_CATALOG_ITEM: TypedDocumentNode<
  UpdatePurchasingCatalogItemMutation,
  UpdatePurchasingCatalogItemMutationVariables
> = gql`
  mutation updatePurchasingCatalogItem($_id: String!, $name: String!, $unit: String!, $category: String, $company: String, $description: String, $defaultUnitPrice: Float) {
    updatePurchasingCatalogItem(_id: $_id, name: $name, unit: $unit, category: $category, company: $company, description: $description, defaultUnitPrice: $defaultUnitPrice) {
      _id
      name
      unit
      category
      company
      imageUrl
      description
      defaultUnitPrice
      lastUnitPrice
      isActive
      createdAt
      createdBy
      updatedAt
      updatedBy
    }
  }
`;

export default UPDATE_PURCHASING_CATALOG_ITEM;
