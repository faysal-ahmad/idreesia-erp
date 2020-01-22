import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export const permissionsData = [
  {
    title: 'Admin',
    key: 'module-admin',
    children: [
      {
        title: 'Security Accounts',
        key: 'module-admin-security-accounts',
        children: [
          {
            title: 'View Accounts',
            key: PermissionConstants.ADMIN_VIEW_ACCOUNTS,
          },
          {
            title: 'Manage Accounts',
            key: PermissionConstants.ADMIN_MANAGE_ACCOUNTS,
          },
        ],
      },
      {
        title: 'Physical Stores',
        key: 'module-admin-physical-stores',
        children: [
          {
            title: 'View Physical Stores',
            key: PermissionConstants.ADMIN_VIEW_PHYSICAL_STORES,
          },
          {
            title: 'Manage Physical Stores',
            key: PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES,
          },
        ],
      },
      {
        title: 'Accounts',
        key: 'module-admin-companies',
        children: [
          {
            title: 'View Companies',
            key: PermissionConstants.ADMIN_VIEW_COMPANIES,
          },
          {
            title: 'Manage Companies',
            key: PermissionConstants.ADMIN_MANAGE_COMPANIES,
          },
        ],
      },
    ],
  },
  {
    title: 'Accounts',
    key: 'module-accounts',
    children: [
      {
        title: 'Account Heads',
        key: 'module-accounts-account-heads',
        children: [
          {
            title: 'View Account Heads',
            key: PermissionConstants.ACCOUNTS_VIEW_ACCOUNT_HEADS,
          },
          {
            title: 'Manage Account Heads',
            key: PermissionConstants.ACCOUNTS_ACCOUNT_HEADS,
          },
        ],
      },
      {
        title: 'View Activity Sheet',
        key: PermissionConstants.ACCOUNTS_VIEW_ACTIVTY_SHEET,
      },
      {
        title: 'Vouchers',
        key: 'module-accounts-vouchers',
        children: [
          {
            title: 'View Vouchers',
            key: PermissionConstants.ACCOUNTS_VIEW_VOUCHERS,
          },
          {
            title: 'Manage Vouchers',
            key: PermissionConstants.ACCOUNTS_MANAGE_VOUCHERS,
          },
        ],
      },
      {
        title: 'Amaanat Logs',
        key: 'module-accounts-amaanat-logs',
        children: [
          {
            title: 'View Amaanat Logs',
            key: PermissionConstants.ACCOUNTS_VIEW_AMAANAT_LOGS,
          },
          {
            title: 'Manage Amaanat Logs',
            key: PermissionConstants.ACCOUNTS_MANAGE_AMAANAT_LOGS,
          },
        ],
      },
    ],
  },
  {
    title: 'HR',
    key: 'module-hr',
    children: [
      {
        title: 'Manage Setup Data',
        key: PermissionConstants.HR_MANAGE_SETUP_DATA,
      },
      {
        title: 'Karkuns',
        key: 'module-hr-karkuns',
        children: [
          {
            title: 'View Karkuns Data',
            key: PermissionConstants.HR_VIEW_KARKUNS,
          },
          {
            title: 'Manage Karkuns Data',
            key: PermissionConstants.HR_MANAGE_KARKUNS,
          },
          {
            title: 'Delete Karkuns Data',
            key: PermissionConstants.HR_DELETE_KARKUNS,
          },
        ],
      },
      {
        title: 'Employees',
        key: 'module-hr-employees',
        children: [
          {
            title: 'View Employees Data',
            key: PermissionConstants.HR_VIEW_EMPLOYEES,
          },
          {
            title: 'Manage Employees Data',
            key: PermissionConstants.HR_MANAGE_EMPLOYEES,
          },
          {
            title: 'Delete Employees Data',
            key: PermissionConstants.HR_DELETE_EMPLOYEES,
          },
          {
            title: 'Approve Salaries Data',
            key: PermissionConstants.HR_APPROVE_SALARIES,
          },
        ],
      },
      {
        title: 'Shared Residences',
        key: 'module-hr-shared-residences',
        children: [
          {
            title: 'View Shared Residences',
            key: PermissionConstants.HR_VIEW_SHARED_RESIDENCES,
          },
          {
            title: 'Manage Shared Residences',
            key: PermissionConstants.HR_MANAGE_SHARED_RESIDENCES,
          },
        ],
      },
    ],
  },
  {
    title: 'Security',
    key: 'module-security',
    children: [
      {
        title: 'Mehfils',
        key: 'module-security-mehfils',
        children: [
          {
            title: 'View Mehfils',
            key: PermissionConstants.SECURITY_VIEW_MEHFILS,
          },
          {
            title: 'Manage Mehfils',
            key: PermissionConstants.SECURITY_MANAGE_MEHFILS,
          },
        ],
      },
      {
        title: 'Karkun Verification',
        key: PermissionConstants.SECURITY_VIEW_KARKUN_VERIFICATION,
      },
      {
        title: 'Visitor Registration',
        key: 'module-security-visitor-registration',
        children: [
          {
            title: 'View Visitors',
            key: PermissionConstants.SECURITY_VIEW_VISITORS,
          },
          {
            title: 'Manage Visitors',
            key: PermissionConstants.SECURITY_MANAGE_VISITORS,
          },
        ],
      },
    ],
  },
  {
    title: 'Inventory',
    key: 'module-inventory',
    children: [
      {
        title: 'Manage Setup Data',
        key: PermissionConstants.IN_MANAGE_SETUP_DATA,
      },
      {
        title: 'Stock Items',
        key: 'module-inventory-stock-items',
        children: [
          {
            title: 'View Stock Items',
            key: PermissionConstants.IN_VIEW_STOCK_ITEMS,
          },
          {
            title: 'Manage Stock Items',
            key: PermissionConstants.IN_MANAGE_STOCK_ITEMS,
          },
        ],
      },
      {
        title: 'Issuance Forms',
        key: 'module-inventory-issuance-forms',
        children: [
          {
            title: 'View Issuance Forms',
            key: PermissionConstants.IN_VIEW_ISSUANCE_FORMS,
          },
          {
            title: 'Manage Issuance Forms',
            key: PermissionConstants.IN_MANAGE_ISSUANCE_FORMS,
          },
          {
            title: 'Approve Issuance Forms',
            key: PermissionConstants.IN_APPROVE_ISSUANCE_FORMS,
          },
        ],
      },
      {
        title: 'Purchase Forms',
        key: 'module-inventory-purchase-forms',
        children: [
          {
            title: 'View Purchase Forms',
            key: PermissionConstants.IN_VIEW_PURCHASE_FORMS,
          },
          {
            title: 'Manage Purchase Forms',
            key: PermissionConstants.IN_MANAGE_PURCHASE_FORMS,
          },
          {
            title: 'Approve Purchase Forms',
            key: PermissionConstants.IN_APPROVE_PURCHASE_FORMS,
          },
        ],
      },
      {
        title: 'Stock Adjustments',
        key: 'module-inventory-stock-adjustments',
        children: [
          {
            title: 'Manage Stock Adjustments',
            key: PermissionConstants.IN_MANAGE_STOCK_ADJUSTMENTS,
          },
          {
            title: 'Approve Stock Adjustments',
            key: PermissionConstants.IN_APPROVE_STOCK_ADJUSTMENTS,
          },
        ],
      },
    ],
  },
];
