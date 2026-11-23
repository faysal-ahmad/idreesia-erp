import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingSpendingByMonthQuery,
  PurchasingSpendingByMonthQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_SPENDING_BY_MONTH: TypedDocumentNode<
  PurchasingSpendingByMonthQuery,
  PurchasingSpendingByMonthQueryVariables
> = gql`
  query purchasingSpendingByMonth($fromDate: String, $toDate: String) {
    purchasingSpendingByMonth(fromDate: $fromDate, toDate: $toDate) {
      month
      invoiceCount
      total
    }
  }
`;

export default PURCHASING_SPENDING_BY_MONTH;
