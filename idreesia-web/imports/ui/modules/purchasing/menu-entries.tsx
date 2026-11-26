import React, { type CSSProperties } from 'react';
import {
  BarChartOutlined,
  BankOutlined,
  BookOutlined,
  ApartmentOutlined,
  CarOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FileDoneOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  LineChartOutlined,
  PieChartOutlined,
  AuditOutlined,
  SafetyCertificateOutlined,
  FormOutlined,
  ProfileOutlined,
  SettingOutlined,
  ShopOutlined,
  SwapOutlined,
  WalletOutlined,
  TagsOutlined,
  ToolOutlined,
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
  // Key of the sidebar group this entry is nested under.
  group?: string;
}

export interface MenuGroup {
  key: string;
  label: string;
  icon: React.ReactNode;
}

export const menuGroups: MenuGroup[] = [
  {
    key: 'petty-cash',
    label: 'Petty Cash',
    icon: <WalletOutlined style={IconStyle} />,
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChartOutlined style={IconStyle} />,
  },
  {
    key: 'setup',
    label: 'Setup',
    icon: <ToolOutlined style={IconStyle} />,
  },
  {
    key: 'administration',
    label: 'Administration',
    icon: <SettingOutlined style={IconStyle} />,
  },
];

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
    key: 'petty-cash-vouchers',
    label: 'Petty Cash Vouchers',
    subModuleName: SubModuleNames.pettyCashVouchers,
    basePath: paths.pettyCashVouchersPath,
    icon: <WalletOutlined style={IconStyle} />,
    permissions: [
      P.PURCHASING_VIEW_PETTY_CASH,
      P.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS,
      P.PURCHASING_APPROVE_PETTY_CASH_VOUCHERS,
    ],
    group: 'petty-cash',
  },
  {
    key: 'petty-cash-replenishments',
    label: 'Petty Cash Replenishments',
    subModuleName: SubModuleNames.pettyCashReplenishments,
    basePath: paths.pettyCashReplenishmentsPath,
    icon: <SwapOutlined style={IconStyle} />,
    permissions: [
      P.PURCHASING_VIEW_PETTY_CASH,
      P.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS,
      P.PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS,
    ],
    group: 'petty-cash',
  },
  {
    key: 'vendors',
    label: 'Vendors',
    subModuleName: SubModuleNames.vendors,
    basePath: paths.vendorsPath,
    icon: <ShopOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_VENDORS, P.PURCHASING_MANAGE_VENDORS],
    group: 'setup',
  },
  {
    key: 'petty-cash-funds',
    label: 'Petty Cash Funds',
    subModuleName: SubModuleNames.pettyCashFunds,
    basePath: paths.pettyCashFundsPath,
    icon: <BankOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_PETTY_CASH, P.PURCHASING_MANAGE_PETTY_CASH_FUNDS],
    group: 'setup',
  },
  {
    key: 'petty-cash-expense-heads',
    label: 'Petty Cash Expense Heads',
    subModuleName: SubModuleNames.pettyCashExpenseHeads,
    basePath: paths.pettyCashExpenseHeadsPath,
    icon: <ApartmentOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_PETTY_CASH, P.PURCHASING_MANAGE_PETTY_CASH_FUNDS],
    group: 'setup',
  },
  {
    key: 'catalog',
    label: 'Catalog',
    subModuleName: SubModuleNames.catalog,
    basePath: paths.catalogPath,
    icon: <TagsOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_MANAGE_CATALOG],
    group: 'setup',
  },
  {
    key: 'report-spending-by-vendor',
    label: 'Spending by Vendor',
    subModuleName: SubModuleNames.reportSpendingByVendor,
    basePath: paths.reportSpendingByVendorPath,
    icon: <PieChartOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
    group: 'reports',
  },
  {
    key: 'report-spending-by-month',
    label: 'Spending by Month',
    subModuleName: SubModuleNames.reportSpendingByMonth,
    basePath: paths.reportSpendingByMonthPath,
    icon: <LineChartOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
    group: 'reports',
  },
  {
    key: 'report-open-orders',
    label: 'Open Orders',
    subModuleName: SubModuleNames.reportOpenOrders,
    basePath: paths.reportOpenOrdersPath,
    icon: <FileSearchOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
    group: 'reports',
  },
  {
    key: 'report-payables-aging',
    label: 'Payables Aging',
    subModuleName: SubModuleNames.reportPayablesAging,
    basePath: paths.reportPayablesAgingPath,
    icon: <FieldTimeOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
    group: 'reports',
  },
  {
    key: 'report-vendor-ledger',
    label: 'Vendor Ledger',
    subModuleName: SubModuleNames.reportVendorLedger,
    basePath: paths.reportVendorLedgerPath,
    icon: <BookOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_REPORTS],
    group: 'reports',
  },
  {
    key: 'audit-logs',
    label: 'Audit Logs',
    subModuleName: SubModuleNames.auditLogs,
    basePath: paths.auditLogsPath,
    icon: <AuditOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_VIEW_AUDIT_LOGS],
    group: 'administration',
  },
  {
    key: 'permissions',
    label: 'Permissions',
    subModuleName: SubModuleNames.permissions,
    basePath: paths.permissionsPath,
    icon: <SafetyCertificateOutlined style={IconStyle} />,
    permissions: [P.PURCHASING_MANAGE_PERMISSIONS],
    group: 'administration',
  },
];

export default entries;
