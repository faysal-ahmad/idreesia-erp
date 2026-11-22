import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingCatalogItemsQuery,
  PagedPurchasingCatalogItemsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_CATALOG_ITEMS: TypedDocumentNode<
  PagedPurchasingCatalogItemsQuery,
  PagedPurchasingCatalogItemsQueryVariables
> = gql`
  query pagedPurchasingCatalogItems($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingCatalogItems(search: $search, isActive: $isActive, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        name
        unit
        category
        defaultUnitPrice
        lastUnitPrice
        isActive
      }
    }
  }
`;

export default PAGED_PURCHASING_CATALOG_ITEMS;
