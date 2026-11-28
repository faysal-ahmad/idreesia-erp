import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingPettyCashLedgerQuery,
  PurchasingPettyCashLedgerQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const PURCHASING_PETTY_CASH_LEDGER: TypedDocumentNode<
  PurchasingPettyCashLedgerQuery,
  PurchasingPettyCashLedgerQueryVariables
> = gql`
  query purchasingPettyCashLedger($fundId: String!, $fromDate: String, $toDate: String) {
    purchasingPettyCashLedger(fundId: $fundId, fromDate: $fromDate, toDate: $toDate) {
      openingBalance
      replenishmentTotal
      voucherTotal
      closingBalance
      heads {
        _id
        name
        total
      }
    }
  }
`;
