import React from 'react';
import {
  AppOutline,
  BillOutline,
  CheckCircleOutline,
  ContentOutline,
  FileOutline,
  GiftOutline,
  PayCircleOutline,
  ReceivePaymentOutline,
  ShopbagOutline,
  TeamOutline,
  UnorderedListOutline,
} from 'antd-mobile-icons';
import { ModuleNames, ModulePaths, Permissions } from 'meteor/idreesia-common/constants';

import type { ModuleDefinition } from '../types';
import { ApprovalsFeature } from './approvals/approvals-feature';
import { CatalogFeature } from './catalog/catalog-feature';
import { DashboardFeature } from './dashboard/dashboard-feature';
import { InvoicesFeature } from './invoices/invoices-feature';
import { OrdersFeature } from './orders/orders-feature';
import { PurchasingPaths } from './paths';
import { PaymentsFeature } from './payments/payments-feature';
import { ReceiptsFeature } from './receipts/receipts-feature';
import { ReceivingFeature } from './receiving/receiving-feature';
import { RequisitionsFeature } from './requisitions/requisitions-feature';
import { VendorsFeature } from './vendors/vendors-feature';

const P = Permissions;

export const PurchasingModule: ModuleDefinition = {
  name: ModuleNames.purchasing,
  description: 'Approvals, receiving and purchasing records',
  icon: <ShopbagOutline />,
  path: ModulePaths.purchasing,
  features: [
    {
      key: 'dashboard',
      title: 'Dashboard',
      description: 'What needs attention and what is owed',
      icon: <AppOutline />,
      path: PurchasingPaths.dashboard,
      permissions: [P.PURCHASING_VIEW_REPORTS],
      component: DashboardFeature,
    },
    {
      key: 'approvals',
      title: 'Approvals',
      description: 'Requisitions and orders waiting for your decision',
      icon: <CheckCircleOutline />,
      path: PurchasingPaths.approvals,
      permissions: [P.PURCHASING_APPROVE_REQUISITIONS, P.PURCHASING_APPROVE_ORDERS],
      component: ApprovalsFeature,
    },
    {
      key: 'receiving',
      title: 'Receiving',
      description: 'Record goods as they arrive, with photos',
      icon: <ReceivePaymentOutline />,
      path: PurchasingPaths.receiving,
      permissions: [P.PURCHASING_MANAGE_RECEIPTS],
      component: ReceivingFeature,
    },
    {
      key: 'requisitions',
      title: 'Requisitions',
      description: 'Ask for items; track requests',
      icon: <UnorderedListOutline />,
      path: PurchasingPaths.requisitions,
      permissions: [
        P.PURCHASING_VIEW_REQUISITIONS,
        P.PURCHASING_MANAGE_REQUISITIONS,
        P.PURCHASING_APPROVE_REQUISITIONS,
      ],
      component: RequisitionsFeature,
    },
    {
      key: 'orders',
      title: 'Purchase orders',
      description: 'Orders placed with vendors',
      icon: <ContentOutline />,
      path: PurchasingPaths.orders,
      permissions: [P.PURCHASING_VIEW_ORDERS, P.PURCHASING_MANAGE_ORDERS, P.PURCHASING_APPROVE_ORDERS],
      component: OrdersFeature,
    },
    {
      key: 'receipts',
      title: 'Goods receipts',
      description: 'What was delivered and when',
      icon: <GiftOutline />,
      path: PurchasingPaths.receipts,
      permissions: [P.PURCHASING_VIEW_RECEIPTS, P.PURCHASING_MANAGE_RECEIPTS],
      component: ReceiptsFeature,
    },
    {
      key: 'invoices',
      title: 'Invoices',
      description: 'Vendor invoices and what is owed',
      icon: <BillOutline />,
      path: PurchasingPaths.invoices,
      permissions: [P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES],
      component: InvoicesFeature,
    },
    {
      key: 'payments',
      title: 'Payments',
      description: 'Payments made to vendors',
      icon: <PayCircleOutline />,
      path: PurchasingPaths.payments,
      permissions: [P.PURCHASING_VIEW_PAYMENTS, P.PURCHASING_MANAGE_PAYMENTS],
      component: PaymentsFeature,
    },
    {
      key: 'vendors',
      title: 'Vendors',
      description: 'Look up and call vendors',
      icon: <TeamOutline />,
      path: PurchasingPaths.vendors,
      permissions: [P.PURCHASING_VIEW_VENDORS, P.PURCHASING_MANAGE_VENDORS],
      component: VendorsFeature,
    },
    {
      key: 'catalog',
      title: 'Catalog',
      description: 'Items and their pictures',
      icon: <FileOutline />,
      path: PurchasingPaths.catalog,
      permissions: [
        P.PURCHASING_MANAGE_CATALOG,
        P.PURCHASING_VIEW_REQUISITIONS,
        P.PURCHASING_MANAGE_REQUISITIONS,
        P.PURCHASING_VIEW_ORDERS,
      ],
      component: CatalogFeature,
    },
  ],
};
