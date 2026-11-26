import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

interface PermissionNode {
  title: string;
  key: string;
  children?: PermissionNode[];
}

export const AdminPermissionsData: PermissionNode = {
  title: 'Admin',
  key: 'module-admin',
  children: [
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
        {
          title: 'View Security Logs',
          key: PermissionConstants.ADMIN_VIEW_SECURITY_LOGS,
        },
      ],
    },
    {
      title: 'Instance Management',
      key: 'module-admin-instance-management',
      children: [
        {
          title: 'Physical Stores',
          key: 'module-admin-physical-stores',
          children: [
            {
              title: 'Manage Physical Stores',
              key: PermissionConstants.ADMIN_MANAGE_PHYSICAL_STORES,
            },
          ],
        },
      ],
    },
    {
      title: 'Reference Data',
      key: 'module-admin-locations-management',
      children: [
        {
          title: 'Manage Cities & Mehfils',
          key: PermissionConstants.ADMIN_MANAGE_CITIES,
        },
        {
          title: 'Manage People Tags',
          key: PermissionConstants.ADMIN_MANAGE_PEOPLE_TAGS,
        },
        {
          title: 'Manage Free Form Data',
          key: PermissionConstants.ADMIN_MANAGE_FREE_FORM_DATA,
        },
      ],
    },
    {
      title: 'Data Management',
      key: 'module-admin-data-management',
      children: [
        {
          title: 'Manage Deleted People',
          key: PermissionConstants.ADMIN_MANAGE_DELETED_PEOPLE,
        },
        {
          title: 'Manage Duplicate People',
          key: PermissionConstants.ADMIN_MANAGE_DUPLICATE_PEOPLE,
        },
      ],
    },
    {
      title: 'Scheduled Jobs',
      key: 'module-admin-scheduled-jobs',
      children: [
        {
          title: 'Manage Scheduled Jobs',
          key: PermissionConstants.ADMIN_MANAGE_SCHEDULED_JOBS,
        },
      ],
    },
    {
      title: 'Committees',
      key: 'module-admin-committees',
      children: [
        {
          title: 'View Committees Data',
          key: PermissionConstants.ADMIN_VIEW_COMMITTEES,
        },
        {
          title: 'Manage Committees Data',
          key: PermissionConstants.ADMIN_MANAGE_COMMITTEES,
        },
      ],
    },
    {
      title: 'Locations',
      key: 'module-admin-org-locations',
      children: [
        {
          title: 'View Locations',
          key: PermissionConstants.ADMIN_VIEW_ORG_LOCATIONS,
        },
        {
          title: 'Manage Locations',
          key: PermissionConstants.ADMIN_MANAGE_ORG_LOCATIONS,
        },
      ],
    },
  ],
};

export const HrPermissionsData: PermissionNode = {
  title: 'HR',
  key: 'module-hr',
  children: [
    {
      title: 'View Audit Logs',
      key: PermissionConstants.HR_VIEW_AUDIT_LOGS,
    },
    {
      title: 'Manage HR Permissions',
      key: PermissionConstants.HR_MANAGE_PERMISSIONS,
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
          title: 'Manage Karkuns Setup Data',
          key: PermissionConstants.HR_MANAGE_KARKUNS_SETUP_DATA,
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
          title: 'Manage Employees Setup Data',
          key: PermissionConstants.HR_MANAGE_EMPLOYEES_SETUP_DATA,
        },
      ],
    },
  ],
};

export const SecurityPermissionsData: PermissionNode = {
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
    {
      title: 'Security Server',
      key: 'module-security-security-server',
      children: [
        {
          title: 'View Security Server Data',
          key: PermissionConstants.SECURITY_VIEW_SECURITY_SERVER_DATA,
        },
        {
          title: 'Manage Security Server Data',
          key: PermissionConstants.SECURITY_MANAGE_SECURITY_SERVER_DATA,
        },
        {
          title: 'Sync Security Server Data (service account)',
          key: PermissionConstants.SECURITY_SYNC_SECURITY_SERVER_DATA,
        },
      ],
    },
    {
      title: 'Setup',
      key: 'module-security-setup',
      children: [
        {
          title: 'Manage Setup Data',
          key: PermissionConstants.SECURITY_MANAGE_SETUP_DATA,
        },
      ],
    },
    {
      title: 'Administration',
      key: 'module-security-administration',
      children: [
        {
          title: 'Manage Security Permissions',
          key: PermissionConstants.SECURITY_MANAGE_PERMISSIONS,
        },
        {
          title: 'View Audit Logs',
          key: PermissionConstants.SECURITY_VIEW_AUDIT_LOGS,
        },
      ],
    },
  ],
};

export const CorrespondencePermissionsData: PermissionNode = {
  title: 'Correspondence',
  key: 'module-correspondence',
  children: [
    {
      title: 'Inbox',
      key: 'module-correspondence-inbox',
      children: [
        {
          title: 'View Messages',
          key: PermissionConstants.CORRESPONDENCE_INBOX_VIEW_MESSAGES,
        },
        {
          title: 'Reply to Messages',
          key: PermissionConstants.CORRESPONDENCE_INBOX_REPLY_TO_MESSAGES,
        },
      ],
    },
  ],
};

const purchasingLeaf = (title: string, key: string): PermissionNode => ({
  title,
  key,
});

export const PurchasingPermissionsData: PermissionNode = {
  title: 'Purchasing',
  key: 'module-purchasing',
  children: [
    {
      title: 'Setup',
      key: 'module-purchasing-setup',
      children: [
        purchasingLeaf('View Vendors', PermissionConstants.PURCHASING_VIEW_VENDORS),
        purchasingLeaf('Manage Vendors', PermissionConstants.PURCHASING_MANAGE_VENDORS),
        purchasingLeaf('Manage Catalog', PermissionConstants.PURCHASING_MANAGE_CATALOG),
      ],
    },
    {
      title: 'Requisitions',
      key: 'module-purchasing-requisitions',
      children: [
        purchasingLeaf('View Requisitions', PermissionConstants.PURCHASING_VIEW_REQUISITIONS),
        purchasingLeaf('Manage Requisitions', PermissionConstants.PURCHASING_MANAGE_REQUISITIONS),
        purchasingLeaf('Approve Requisitions', PermissionConstants.PURCHASING_APPROVE_REQUISITIONS),
      ],
    },
    {
      title: 'Purchase Orders',
      key: 'module-purchasing-orders',
      children: [
        purchasingLeaf('View Orders', PermissionConstants.PURCHASING_VIEW_ORDERS),
        purchasingLeaf('Manage Orders and Quotes', PermissionConstants.PURCHASING_MANAGE_ORDERS),
        purchasingLeaf('Approve Orders', PermissionConstants.PURCHASING_APPROVE_ORDERS),
      ],
    },
    {
      title: 'Goods Receipts',
      key: 'module-purchasing-receipts',
      children: [
        purchasingLeaf('View Receipts', PermissionConstants.PURCHASING_VIEW_RECEIPTS),
        purchasingLeaf('Manage Receipts', PermissionConstants.PURCHASING_MANAGE_RECEIPTS),
      ],
    },
    {
      title: 'Invoices and Payments',
      key: 'module-purchasing-finance',
      children: [
        purchasingLeaf('View Invoices', PermissionConstants.PURCHASING_VIEW_INVOICES),
        purchasingLeaf('Manage Invoices', PermissionConstants.PURCHASING_MANAGE_INVOICES),
        purchasingLeaf('View Payments', PermissionConstants.PURCHASING_VIEW_PAYMENTS),
        purchasingLeaf('Manage Payments', PermissionConstants.PURCHASING_MANAGE_PAYMENTS),
      ],
    },
    {
      title: 'Petty Cash',
      key: 'module-purchasing-petty-cash',
      children: [
        purchasingLeaf('View Petty Cash', PermissionConstants.PURCHASING_VIEW_PETTY_CASH),
        purchasingLeaf('Manage Petty Cash Funds', PermissionConstants.PURCHASING_MANAGE_PETTY_CASH_FUNDS),
        purchasingLeaf('Manage Petty Cash Vouchers', PermissionConstants.PURCHASING_MANAGE_PETTY_CASH_VOUCHERS),
        purchasingLeaf('Approve Petty Cash Vouchers', PermissionConstants.PURCHASING_APPROVE_PETTY_CASH_VOUCHERS),
        purchasingLeaf('Approve Petty Cash Replenishments', PermissionConstants.PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS),
      ],
    },
    {
      title: 'Administration',
      key: 'module-purchasing-administration',
      children: [
        purchasingLeaf('View Reports', PermissionConstants.PURCHASING_VIEW_REPORTS),
        purchasingLeaf('View Audit Logs', PermissionConstants.PURCHASING_VIEW_AUDIT_LOGS),
        purchasingLeaf('Manage Purchasing Permissions', PermissionConstants.PURCHASING_MANAGE_PERMISSIONS),
      ],
    },
  ],
};
