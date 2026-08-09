import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStockItemsQuery,
  PagedStockItemsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_STOCK_ITEMS: TypedDocumentNode<
  PagedStockItemsQuery,
  PagedStockItemsQueryVariables
> = gql`
  query pagedStockItems($physicalStoreId: String!, $queryString: String) {
    pagedStockItems(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        name
        formattedName
        company
        details
        imageId
        categoryName
        unitOfMeasurement
        minStockLevel
        currentStockLevel
        totalStockLevel
        verifiedOn
        purchaseFormsCount
        issuanceFormsCount
        stockAdjustmentsCount
      }
    }
  }
`;
