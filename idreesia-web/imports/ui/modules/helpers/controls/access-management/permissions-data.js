import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export const adminPermissionsData = {
  title: 'Admin',
  key: 'module-admin',
  children: [
    {
      title: 'Admin Jobs',
      key: 'module-admin-admin-jobs',
      children: [
        {
          title: 'View Admin Jobs',
          key: PermissionConstants.ADMIN_VIEW_ADMIN_JOBS,
        },
        {
          title: 'Manage Admin Jobs',
          key: PermissionConstants.ADMIN_MANAGE_ADMIN_JOBS,
        },
      ],
    },
    {
      title: 'Users & Groups',
      key: 'module-admin-users-and-groups',
      children: [
        {
          title: 'View Users & Groups',
          key: PermissionConstants.ADMIN_VIEW_USERS_AND_GROUPS,
        },
        {
          title: 'Manage Users & Groups',
          key: PermissionConstants.ADMIN_MANAGE_USERS_AND_GROUPS,
        },
      ],
    },
    {
      title: 'Instance Management',
      key: 'module-admin-instance-management',
      children: [
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
          title: 'Portals',
          key: 'module-admin-portals',
          children: [
            {
              title: 'View Portals',
              key: PermissionConstants.ADMIN_VIEW_PORTALS,
            },
            {
              title: 'Manage Portals',
              key: PermissionConstants.ADMIN_MANAGE_PORTALS,
            },
          ],
        },
      ],
    },
  ],
};

export const accountsPermissionsData = {
  title: 'Accounts',
  key: 'module-accounts',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.ACCOUNTS_DELETE_DATA,
    },
    {
      title: 'Manage Setup Data',
      key: PermissionConstants.ACCOUNTS_MANAGE_SETUP_DATA,
    },
    {
      title: 'View Audit Logs',
      key: PermissionConstants.ACCOUNTS_VIEW_AUDIT_LOGS,
    },
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
          key: PermissionConstants.ACCOUNTS_MANAGE_ACCOUNT_HEADS,
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
      title: 'Payments',
      key: 'module-accounts-payments',
      children: [
        {
          title: 'View Payments',
          key: PermissionConstants.ACCOUNTS_VIEW_PAYMENTS,
        },
        {
          title: 'Manage Payments',
          key: PermissionConstants.ACCOUNTS_MANAGE_PAYMENTS,
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
};

export const hrPermissionsData = {
  title: 'HR',
  key: 'module-hr',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.HR_DELETE_DATA,
    },
    {
      title: 'Manage Setup Data',
      key: PermissionConstants.HR_MANAGE_SETUP_DATA,
    },
    {
      title: 'View Audit Logs',
      key: PermissionConstants.HR_VIEW_AUDIT_LOGS,
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
          title: 'Approve Salaries Data',
          key: PermissionConstants.HR_APPROVE_SALARIES,
        },
      ],
    },
    {
      title: 'Messages',
      key: 'module-hr-messages',
      children: [
        {
          title: 'View Messages',
          key: PermissionConstants.HR_VIEW_MESSAGES,
        },
        {
          title: 'Manage Messages',
          key: PermissionConstants.HR_MANAGE_MESSAGES,
        },
        {
          title: 'Approve Messages',
          key: PermissionConstants.HR_APPROVE_MESSAGES,
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
};

export const inventoryPermissionsData = {
  title: 'Inventory',
  key: 'module-inventory',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.IN_DELETE_DATA,
    },
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
          title: 'View Stock Adjustments',
          key: PermissionConstants.IN_VIEW_STOCK_ADJUSTMENTS,
        },
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
};

export const outstationPermissionsData = {
  title: 'Outstation',
  key: 'module-outstation',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.OUTSTATION_DELETE_DATA,
    },
    {
      title: 'Manage Setup Data',
      key: PermissionConstants.OUTSTATION_MANAGE_SETUP_DATA,
    },
    {
      title: 'View Audit Logs',
      key: PermissionConstants.OUTSTATION_VIEW_AUDIT_LOGS,
    },
    {
      title: 'Members',
      key: 'module-outstation-members',
      children: [
        {
          title: 'View Members',
          key: PermissionConstants.OUTSTATION_VIEW_MEMBERS,
        },
        {
          title: 'Manage Members',
          key: PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        },
      ],
    },
    {
      title: 'Karkuns',
      key: 'module-outstation-karkuns',
      children: [
        {
          title: 'View Karkuns',
          key: PermissionConstants.OUTSTATION_VIEW_KARKUNS,
        },
        {
          title: 'Manage Karkuns',
          key: PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        },
      ],
    },
    {
      title: 'Messages',
      key: 'module-outstation-messages',
      children: [
        {
          title: 'View Messages',
          key: PermissionConstants.OUTSTATION_VIEW_MESSAGES,
        },
        {
          title: 'Manage Messages',
          key: PermissionConstants.OUTSTATION_MANAGE_MESSAGES,
        },
        {
          title: 'Approve Messages',
          key: PermissionConstants.OUTSTATION_APPROVE_MESSAGES,
        },
      ],
    },
  ],
};

export const portalsPermissionsData = {
  title: 'Portals',
  key: 'module-portals',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.PORTALS_DELETE_DATA,
    },
    {
      title: 'View Audit Logs',
      key: PermissionConstants.PORTALS_VIEW_AUDIT_LOGS,
    },
    {
      title: 'Users & Groups',
      key: 'module-portals-users-and-groups',
      children: [
        {
          title: 'View Users & Groups',
          key: PermissionConstants.PORTALS_VIEW_USERS_AND_GROUPS,
        },
        {
          title: 'Manage Users & Groups',
          key: PermissionConstants.PORTALS_MANAGE_USERS_AND_GROUPS,
        },
      ],
    },
    {
      title: 'Karkuns',
      key: 'module-portals-karkuns',
      children: [
        {
          title: 'View Karkuns',
          key: PermissionConstants.PORTALS_VIEW_KARKUNS,
        },
        {
          title: 'Manage Karkuns',
          key: PermissionConstants.PORTALS_MANAGE_KARKUNS,
        },
      ],
    },
    {
      title: 'Members',
      key: 'module-portals-members',
      children: [
        {
          title: 'View Members',
          key: PermissionConstants.PORTALS_VIEW_MEMBERS,
        },
        {
          title: 'Manage Members',
          key: PermissionConstants.PORTALS_MANAGE_MEMBERS,
        },
      ],
    },
    {
      title: 'Amaanat Logs',
      key: 'module-portals-amaanat-logs',
      children: [
        {
          title: 'View Amaanat Logs',
          key: PermissionConstants.PORTALS_VIEW_AMAANAT_LOGS,
        },
        {
          title: 'Manage Amaanat Logs',
          key: PermissionConstants.PORTALS_MANAGE_AMAANAT_LOGS,
        },
      ],
    },
  ],
};

export const securityPermissionsData = {
  title: 'Security',
  key: 'module-security',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.SECURITY_DELETE_DATA,
    },
    {
      title: 'Manage Setup Data',
      key: PermissionConstants.SECURITY_MANAGE_SETUP_DATA,
    },
    {
      title: 'View Audit Logs',
      key: PermissionConstants.SECURITY_VIEW_AUDIT_LOGS,
    },
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
      title: 'Shared Residences',
      key: 'module-security-shared-residences',
      children: [
        {
          title: 'View Shared Residences',
          key: PermissionConstants.SECURITY_VIEW_SHARED_RESIDENCES,
        },
        {
          title: 'Manage Shared Residences',
          key: PermissionConstants.SECURITY_MANAGE_SHARED_RESIDENCES,
        },
      ],
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
};

export const operationsPermissionsData = {
  title: 'Operations',
  key: 'module-operations',
  children: [
    {
      title: 'Delete Data',
      key: PermissionConstants.OP_DELETE_DATA,
    },
    {
      title: 'Manage Setup Data',
      key: PermissionConstants.OP_MANAGE_SETUP_DATA,
    },
    {
      title: 'Visitors',
      key: 'module-operations-visitors',
      children: [
        {
          title: 'View Visitors',
          key: PermissionConstants.OP_VIEW_VISITORS,
        },
        {
          title: 'Manage Visitors',
          key: PermissionConstants.OP_MANAGE_VISITORS,
        },
      ],
    },
    {
      title: 'Imdad Requests',
      key: 'module-operations-imdad-requests',
      children: [
        {
          title: 'View Imdad Requests',
          key: PermissionConstants.OP_VIEW_IMDAD_REQUESTS,
        },
        {
          title: 'Manage Imdad Requests',
          key: PermissionConstants.OP_MANAGE_IMDAD_REQUESTS,
        },
      ],
    },
    {
      title: 'Messages',
      key: 'module-operations-messages',
      children: [
        {
          title: 'View Messages',
          key: PermissionConstants.OP_VIEW_MESSAGES,
        },
        {
          title: 'Manage Messages',
          key: PermissionConstants.OP_MANAGE_MESSAGES,
        },
        {
          title: 'Approve Messages',
          key: PermissionConstants.OP_APPROVE_MESSAGES,
        },
      ],
    },
    {
      title: 'Wazaif',
      key: 'module-operations-wazaif',
      children: [
        {
          title: 'View Wazaif',
          key: PermissionConstants.OP_VIEW_WAZAIF,
        },
        {
          title: 'Manage Wazaif',
          key: PermissionConstants.OP_MANAGE_WAZAIF,
        },
      ],
    },
  ],
};
