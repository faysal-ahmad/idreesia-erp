import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedStockAdjustmentsQuery,
  PagedStockAdjustmentsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PAGED_STOCK_ADJUSTMENTS: TypedDocumentNode<
  PagedStockAdjustmentsQuery,
  PagedStockAdjustmentsQueryVariables
> = gql`
  query pagedStockAdjustments($physicalStoreId: String!, $queryString: String) {
    pagedStockAdjustments(
      physicalStoreId: $physicalStoreId
      queryString: $queryString
    ) {
      totalResults
      data {
        _id
        physicalStoreId
        stockItemId
        adjustmentDate
        adjustedBy
        quantity
        isInflow
        adjustmentReason
        approvedOn
        refStockItem {
          _id
          formattedName
          imageId
        }
        refAdjustedBy {
          _id
          sharedData {
            name
          }
        }
      }
    }
  }
`;
