import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  PurchasingDashboardQuery,
  PurchasingDashboardQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

const PURCHASING_DASHBOARD: TypedDocumentNode<
  PurchasingDashboardQuery,
  PurchasingDashboardQueryVariables
> = gql`
  query purchasingDashboard {
    purchasingDashboard {
      requisitionsAwaitingApproval
      ordersAwaitingApproval
      openOrders
      overdueInvoices
      totalPayable
      overdueAmount
    }
  }
`;

export default PURCHASING_DASHBOARD;
