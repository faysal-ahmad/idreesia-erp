import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PagedPurchasingVendorsQuery,
  PagedPurchasingVendorsQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PAGED_PURCHASING_VENDORS: TypedDocumentNode<
  PagedPurchasingVendorsQuery,
  PagedPurchasingVendorsQueryVariables
> = gql`
  query pagedPurchasingVendors($search: String, $isActive: Boolean, $pageIndex: Int, $pageSize: Int) {
    pagedPurchasingVendors(search: $search, isActive: $isActive, pageIndex: $pageIndex, pageSize: $pageSize) {
      totalResults
      data {
        _id
        name
        contactPerson
        phone
        paymentTermsDays
        isActive
      }
    }
  }
`;

export default PAGED_PURCHASING_VENDORS;
