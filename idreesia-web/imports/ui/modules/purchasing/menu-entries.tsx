import React, { type CSSProperties } from 'react';
import {
  BarChartOutlined,
  CarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FormOutlined,
  ProfileOutlined,
  ShopOutlined,
  TagsOutlined,
} from '@ant-design/icons';

import { Permissions } from 'meteor/idreesia-common/constants';

import SubModuleNames from './submodule-names';
import { default as paths } from './submodule-paths';

const IconStyle: CSSProperties = {
  fontSize: '20px',
};

export interface MenuEntry {
  key: string;
  label: string;
  subModuleName: string;
  basePath: string;
  icon: React.ReactNode;
  // The menu item shows for a user with any of these.
  permissions: string[];
}

const P = Permissions;

const entries: MenuEntry[] = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    subModuleName: SubModuleNames.dashboard,
    basePath: paths.dashboardPath,
    icon: <DashboardOutlined style={IconStyle} />,
    permissions: [
      P.PURCHASING_VIEW_REPORTS,
      P.PURCHASING_APPROVE_REQUISITIONS,
      P.PURCHASING_APPROVE_ORDERS,
      P.PURCHASING_VIEW_ORDERS,
      P.PURCHASING_VIEW_INVOICES,
      P.PURCHASING_VIEW_PAYMENTS,
    ],
  },
  {
    key: 'requisitions',
    label: 'Requisitions',
    subModuleName: SubModuleNames.requisitions,
    basePath: paths.requisitionsPath,
    icon: <FormOutlined style={IconStyle} />,
    permissions: [
      P.PURCHASING_VIEW_REQUISITIONS,
      P.PURCHASING_MANAGE_REQUISITIONS,
      P.PURCHASING_APPROVE_REQUISITIONS,
    ],
  },
  {
    key: 'quotes',
    label: 'Quotes',
    subModuleName: SubModuleNames.quotes,
    basePath: paths.quotesPath,
    icon: <ProfileOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_ORDERS, P.PURCHASING_MANAGE_ORDERS, P.PURCHASING_APPROVE_ORDERS],
  },
  {
    key: 'orders',
    label: 'Purchase Orders',
    subModuleName: SubModuleNames.orders,
    basePath: paths.ordersPath,
    icon: <FileTextOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_ORDERS, P.PURCHASING_MANAGE_ORDERS, P.PURCHASING_APPROVE_ORDERS],
  },
  {
    key: 'receipts',
    label: 'Goods Receipts',
    subModuleName: SubModuleNames.receipts,
    basePath: paths.receiptsPath,
    icon: <CarOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_RECEIPTS, P.PURCHASING_MANAGE_RECEIPTS],
  },
  {
    key: 'invoices',
    label: 'Invoices',
    subModuleName: SubModuleNames.invoices,
    basePath: paths.invoicesPath,
    icon: <FileDoneOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_INVOICES, P.PURCHASING_MANAGE_INVOICES],
  },
  {
    key: 'payments',
    label: 'Payments',
    subModuleName: SubModuleNames.payments,
    basePath: paths.paymentsPath,
    icon: <CreditCardOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_PAYMENTS, P.PURCHASING_MANAGE_PAYMENTS],
  },
  {
    key: 'vendors',
    label: 'Vendors',
    subModuleName: SubModuleNames.vendors,
    basePath: paths.vendorsPath,
    icon: <ShopOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_VENDORS, P.PURCHASING_MANAGE_VENDORS],
  },
  {
    key: 'catalog',
    label: 'Catalog',
    subModuleName: SubModuleNames.catalog,
    basePath: paths.catalogPath,
    icon: <TagsOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_MANAGE_CATALOG],
  },
  {
    key: 'reports',
    label: 'Reports',
    subModuleName: SubModuleNames.reports,
    basePath: paths.reportsPath,
    icon: <BarChartOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
  },
];

export default entries;
