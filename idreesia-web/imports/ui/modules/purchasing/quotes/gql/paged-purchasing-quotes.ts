import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingQuotesQuery,
  PagedPurchasingQuotesQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_QUOTES: TypedDocumentNode<
  PagedPurchasingQuotesQuery,
  PagedPurchasingQuotesQueryVariables
> = gql`
  query pagedPurchasingQuotes($search: String, $status: String, $vendorId: String, $requisitionId: String, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingQuotes(search: $search, status: $status, vendorId: $vendorId, requisitionId: $requisitionId, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        requisitionId
        vendorId
        vendor {
          _id
          name
        }
        reference
        quoteDate
        validUntil
        total
        status
        version
      }
    }
  }
`;

export default PAGED_PURCHASING_QUOTES;
