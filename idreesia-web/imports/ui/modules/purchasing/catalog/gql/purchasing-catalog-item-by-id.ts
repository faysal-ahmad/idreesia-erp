import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingCatalogItemByIdQuery,
  PurchasingCatalogItemByIdQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_CATALOG_ITEM_BY_ID: TypedDocumentNode<
  PurchasingCatalogItemByIdQuery,
  PurchasingCatalogItemByIdQueryVariables
> = gql`
  query purchasingCatalogItemById($_id: String!) {
    purchasingCatalogItemById(_id: $_id) {
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

export default PURCHASING_CATALOG_ITEM_BY_ID;
