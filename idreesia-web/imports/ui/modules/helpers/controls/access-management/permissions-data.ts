// @ts-nocheck
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

export const AdminPermissionsData = {
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
      title: 'Locations Management',
      key: 'module-admin-locations-management',
      children: [
        {
          title: 'Cities & Mehfils',
          key: 'module-admin-cities',
          children: [
            {
              title: 'Manage Cities & Mehfils',
              key: PermissionConstants.ADMIN_MANAGE_CITIES,
            },
          ],
        },
      ],
    },
  ],
};

export const HrPermissionsData = {
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
  ],
};

export const InventoryPermissionsData = {
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

export const SecurityPermissionsData = {
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
          title: 'View Users',
          key: PermissionConstants.SECURITY_VIEW_USERS,
        },
        {
          title: 'Manage Users',
          key: PermissionConstants.SECURITY_MANAGE_USERS,
        },
        {
          title: 'Delete Data',
          key: PermissionConstants.SECURITY_DELETE_DATA,
        },
        {
          title: 'View Audit Logs',
          key: PermissionConstants.SECURITY_VIEW_AUDIT_LOGS,
        },
      ],
    },
  ],
};

