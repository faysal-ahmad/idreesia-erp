import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingSpendingByVendorQuery,
  PurchasingSpendingByVendorQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_SPENDING_BY_VENDOR: TypedDocumentNode<
  PurchasingSpendingByVendorQuery,
  PurchasingSpendingByVendorQueryVariables
> = gql`
  query purchasingSpendingByVendor($fromDate: String, $toDate: String) {
    purchasingSpendingByVendor(fromDate: $fromDate, toDate: $toDate) {
      vendorId
      vendor {
        _id
        name
      }
      invoiceCount
      total
      paidAmount
    }
  }
`;

export default PURCHASING_SPENDING_BY_VENDOR;
