const Permissions = {
  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  ADMIN_VIEW_USERS_AND_GROUPS: 'admin-view-users-and-groups',
  ADMIN_MANAGE_USERS_AND_GROUPS: 'admin-manage-users-and-groups',

  ADMIN_MANAGE_CITIES: 'admin-manage-cities',
  ADMIN_MANAGE_PEOPLE_TAGS: 'admin-manage-people-tags',
  ADMIN_MANAGE_FREE_FORM_DATA: 'admin-manage-free-form-data',

  ADMIN_MANAGE_SCHEDULED_JOBS: 'admin-manage-scheduled-jobs',
  ADMIN_MANAGE_DELETED_PEOPLE: 'admin-manage-deleted-people',
  ADMIN_MANAGE_DUPLICATE_PEOPLE: 'admin-manage-duplicate-people',
  ADMIN_VIEW_SECURITY_LOGS: 'admin-view-security-logs',

  ADMIN_VIEW_COMMITTEES: 'admin-view-committees',
  ADMIN_MANAGE_COMMITTEES: 'admin-manage-committees',

  ADMIN_VIEW_ORG_LOCATIONS: 'admin-view-org-locations',
  ADMIN_MANAGE_ORG_LOCATIONS: 'admin-manage-org-locations',

  // ****************************************************************************************
  // HR - Karkuns Module
  // ****************************************************************************************
  HR_VIEW_KARKUNS: 'hr-karkuns-view',
  HR_MANAGE_KARKUNS: 'hr-karkuns-manage',
  HR_MANAGE_KARKUNS_SETUP_DATA: 'hr-karkuns-manage-setup-data',
  HR_KARKUNS_VIEW_AUDIT_LOGS: 'hr-karkuns-view-audit-logs',
  HR_KARKUNS_MANAGE_PERMISSIONS: 'hr-karkuns-manage-permissions',

  // ****************************************************************************************
  // HR - Employees Module
  // ****************************************************************************************
  HR_VIEW_EMPLOYEES: 'hr-employees-view',
  HR_MANAGE_EMPLOYEES: 'hr-employees-manage',
  HR_MANAGE_EMPLOYEES_SETUP_DATA: 'hr-employees-manage-setup-data',

  HR_VIEW_LEAVES: 'hr-employees-view-leaves',
  HR_MANAGE_LEAVES: 'hr-employees-manage-leaves',
  HR_APPROVE_LEAVES: 'hr-employees-approve-leaves',

  HR_EMPLOYEES_VIEW_AUDIT_LOGS: 'hr-employees-view-audit-logs',
  HR_EMPLOYEES_MANAGE_PERMISSIONS: 'hr-employees-manage-permissions',

  // ****************************************************************************************
  // Security Module
  // ****************************************************************************************
  SECURITY_MANAGE_SETUP_DATA: 'security-manage-setup-data',
  SECURITY_VIEW_AUDIT_LOGS: 'security-view-audit-logs',
  SECURITY_MANAGE_PERMISSIONS: 'security-manage-permissions',

  SECURITY_VIEW_VISITORS: 'security-view-visitors',
  SECURITY_MANAGE_VISITORS: 'security-manage-visitors',

  SECURITY_VIEW_EVENTS: 'security-view-events',
  SECURITY_MANAGE_EVENTS: 'security-manage-events',

  SECURITY_VIEW_SECURITY_SERVER_DATA: 'security-view-security-server-data',
  SECURITY_MANAGE_SECURITY_SERVER_DATA: 'security-manage-security-server-data',
  SECURITY_SYNC_SECURITY_SERVER_DATA: 'security-sync-security-server-data',

  // ****************************************************************************************
  // Correspondence Module
  // ****************************************************************************************
  CORRESPONDENCE_INBOX_VIEW_MESSAGES: 'correspondence-inbox-view-messages',
  CORRESPONDENCE_INBOX_REPLY_TO_MESSAGES:
    'correspondence-inbox-reply-to-messages',

  // ****************************************************************************************
  // Purchasing Module
  // ****************************************************************************************
  PURCHASING_VIEW_VENDORS: 'purchasing-view-vendors',
  PURCHASING_MANAGE_VENDORS: 'purchasing-manage-vendors',
  PURCHASING_MANAGE_CATALOG: 'purchasing-manage-catalog',

  PURCHASING_VIEW_REQUISITIONS: 'purchasing-view-requisitions',
  PURCHASING_MANAGE_REQUISITIONS: 'purchasing-manage-requisitions',
  PURCHASING_APPROVE_REQUISITIONS: 'purchasing-approve-requisitions',

  PURCHASING_VIEW_ORDERS: 'purchasing-view-orders',
  PURCHASING_MANAGE_ORDERS: 'purchasing-manage-orders',
  PURCHASING_APPROVE_ORDERS: 'purchasing-approve-orders',

  PURCHASING_VIEW_RECEIPTS: 'purchasing-view-receipts',
  PURCHASING_MANAGE_RECEIPTS: 'purchasing-manage-receipts',

  PURCHASING_VIEW_INVOICES: 'purchasing-view-invoices',
  PURCHASING_MANAGE_INVOICES: 'purchasing-manage-invoices',

  PURCHASING_VIEW_PAYMENTS: 'purchasing-view-payments',
  PURCHASING_MANAGE_PAYMENTS: 'purchasing-manage-payments',

  PURCHASING_VIEW_PETTY_CASH: 'purchasing-view-petty-cash',
  PURCHASING_MANAGE_PETTY_CASH_FUNDS: 'purchasing-manage-petty-cash-funds',
  PURCHASING_MANAGE_PETTY_CASH_VOUCHERS: 'purchasing-manage-petty-cash-vouchers',
  PURCHASING_APPROVE_PETTY_CASH_VOUCHERS: 'purchasing-approve-petty-cash-vouchers',
  PURCHASING_APPROVE_PETTY_CASH_REPLENISHMENTS: 'purchasing-approve-petty-cash-replenishments',

  PURCHASING_VIEW_REPORTS: 'purchasing-view-reports',
  PURCHASING_VIEW_AUDIT_LOGS: 'purchasing-view-audit-logs',
  PURCHASING_MANAGE_PERMISSIONS: 'purchasing-manage-permissions',

  // ****************************************************************************************
  // Stores Module
  // ****************************************************************************************
  // Held on the user (or a group), not per store.
  IN_MANAGE_PHYSICAL_STORES: 'stores-manage-physical-stores',
  IN_MANAGE_PHYSICAL_STORE_PERMISSIONS: 'stores-manage-physical-store-permissions',

  // Held per store (see stores-permissions.ts).
  IN_MANAGE_SETUP_DATA: 'stores-manage-setup-data',
  IN_MANAGE_STOCK_ITEMS: 'stores-manage-stock-items',

  IN_VIEW_STOCK_ADJUSTMENTS: 'stores-view-stock-adjustments',
  IN_MANAGE_STOCK_ADJUSTMENTS: 'stores-manage-stock-adjustments',
  IN_APPROVE_STOCK_ADJUSTMENTS: 'stores-approve-stock-adjustments',

  IN_VIEW_ISSUANCE_FORMS: 'stores-view-issuance-forms',
  IN_MANAGE_ISSUANCE_FORMS: 'stores-manage-issuance-forms',
  IN_APPROVE_ISSUANCE_FORMS: 'stores-approve-issuance-forms',

  IN_VIEW_PURCHASE_FORMS: 'stores-view-purchase-forms',
  IN_MANAGE_PURCHASE_FORMS: 'stores-manage-purchase-forms',
  IN_APPROVE_PURCHASE_FORMS: 'stores-approve-purchase-forms',

  // Raising requisitions with, and receiving goods from, Purchasing.
  IN_VIEW_REQUISITIONS: 'stores-view-requisitions',
  IN_MANAGE_REQUISITIONS: 'stores-manage-requisitions',
  IN_VIEW_RECEIPTS: 'stores-view-receipts',
  IN_MANAGE_RECEIPTS: 'stores-manage-receipts',
};

export default Permissions;
