import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingVendorLedgerQuery,
  PurchasingVendorLedgerQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_VENDOR_LEDGER: TypedDocumentNode<
  PurchasingVendorLedgerQuery,
  PurchasingVendorLedgerQueryVariables
> = gql`
  query purchasingVendorLedger($vendorId: String!, $fromDate: String, $toDate: String) {
    purchasingVendorLedger(vendorId: $vendorId, fromDate: $fromDate, toDate: $toDate) {
      openingBalance
      closingBalance
      entries {
        date
        type
        documentId
        number
        reference
        amount
        balance
      }
    }
  }
`;

export default PURCHASING_VENDOR_LEDGER;
