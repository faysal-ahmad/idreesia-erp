import gql from 'graphql-tag';
import type { TypedDocumentNode } from '@apollo/client';
import type {
  MobilePurchasingDashboardQuery,
  MobilePurchasingDashboardQueryVariables,
  MobilePurchasingPayablesAgingQuery,
  MobilePurchasingPayablesAgingQueryVariables,
} from 'meteor/idreesia-common/types/client-operations';

export const MOBILE_PURCHASING_DASHBOARD: TypedDocumentNode<
  MobilePurchasingDashboardQuery,
  MobilePurchasingDashboardQueryVariables
> = gql`
  query mobilePurchasingDashboard {
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

export const MOBILE_PURCHASING_PAYABLES_AGING: TypedDocumentNode<
  MobilePurchasingPayablesAgingQuery,
  MobilePurchasingPayablesAgingQueryVariables
> = gql`
  query mobilePurchasingPayablesAging {
    purchasingPayablesAging {
      vendorId
      vendor {
        _id
        name
      }
      current
      days1To30
      days31To60
      days61Plus
      total
    }
  }
`;
