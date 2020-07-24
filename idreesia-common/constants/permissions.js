const Permissions = {
  // ****************************************************************************************
  // Accounts Module
  // ****************************************************************************************
  ACCOUNTS_MANAGE_SETUP_DATA: 'accounts-manage-setup-data',
  ACCOUNTS_DELETE_DATA: 'accounts-delete-data',
  ACCOUNTS_VIEW_AUDIT_LOGS: 'accounts-view-audit-logs',

  ACCOUNTS_VIEW_ACCOUNT_HEADS: 'accounts-view-account-heads',
  ACCOUNTS_MANAGE_ACCOUNT_HEADS: 'accounts-manage-account-heads',
  ACCOUNTS_VIEW_ACTIVTY_SHEET: 'accounts-view-activity-sheet',

  ACCOUNTS_VIEW_VOUCHERS: 'accounts-view-vouchers',
  ACCOUNTS_MANAGE_VOUCHERS: 'accounts-manage-vouchers',

  ACCOUNTS_VIEW_PAYMENTS: 'accounts-view-payments',
  ACCOUNTS_MANAGE_PAYMENTS: 'accounts-manage-payments',

  ACCOUNTS_VIEW_AMAANAT_LOGS: 'accounts-view-amaanat-logs',
  ACCOUNTS_MANAGE_AMAANAT_LOGS: 'accounts-manage-amaanat-logs',

  ACCOUNTS_VIEW_IMDAD_REQUESTS: 'accounts-view-imdad-requests',
  ACCOUNTS_MANAGE_IMDAD_REQUESTS: 'accounts-manage-imdad-requests',

  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  ADMIN_VIEW_ADMIN_JOBS: 'admin-view-admin-jobs',
  ADMIN_MANAGE_ADMIN_JOBS: 'admin-manage-admin-jobs',

  ADMIN_VIEW_USERS_AND_GROUPS: 'admin-view-users-and-groups',
  ADMIN_MANAGE_USERS_AND_GROUPS: 'admin-manage-users-and-groups',

  ADMIN_VIEW_PHYSICAL_STORES: 'admin-view-physical-stores',
  ADMIN_MANAGE_PHYSICAL_STORES: 'admin-manage-physical-stores',

  ADMIN_VIEW_COMPANIES: 'admin-view-companies',
  ADMIN_MANAGE_COMPANIES: 'admin-manage-companies',

  ADMIN_VIEW_PORTALS: 'admin-view-portals',
  ADMIN_MANAGE_PORTALS: 'admin-manage-portals',

  // ****************************************************************************************
  // HR Module
  // ****************************************************************************************
  HR_MANAGE_SETUP_DATA: 'hr-manage-setup-data',
  HR_DELETE_DATA: 'hr-delete-data',
  HR_VIEW_AUDIT_LOGS: 'hr-view-audit-logs',

  HR_VIEW_KARKUNS: 'hr-view-karkuns',
  HR_MANAGE_KARKUNS: 'hr-manage-karkuns',

  HR_VIEW_EMPLOYEES: 'hr-view-employees',
  HR_MANAGE_EMPLOYEES: 'hr-manage-employees',
  HR_APPROVE_SALARIES: 'hr-approve-salaries',

  HR_VIEW_SHARED_RESIDENCES: 'hr-view-shared-residences',
  HR_MANAGE_SHARED_RESIDENCES: 'hr-manage-shared-residences',

  HR_VIEW_MESSAGES: 'hr-view-messages',
  HR_MANAGE_MESSAGES: 'hr-manage-messages',
  HR_APPROVE_MESSAGES: 'hr-approve-messages',

  // ****************************************************************************************
  // Operations Module
  // ****************************************************************************************
  OP_MANAGE_SETUP_DATA: 'operations-manage-setup-data',
  OP_DELETE_DATA: 'operations-delete-data',

  OP_VIEW_VISITORS: 'operations-view-visitors',
  OP_MANAGE_VISITORS: 'operations-manage-visitors',

  OP_VIEW_WAZAIF: 'operations-view-wazaif',
  OP_MANAGE_WAZAIF: 'operations-manage-wazaif',

  OP_VIEW_MESSAGES: 'operations-view-messages',
  OP_MANAGE_MESSAGES: 'operations-manage-messages',
  OP_APPROVE_MESSAGES: 'operations-approve-messages',

  // ****************************************************************************************
  // Outstation Module
  // ****************************************************************************************
  OUTSTATION_MANAGE_SETUP_DATA: 'outstation-manage-setup-data',
  OUTSTATION_DELETE_DATA: 'outstation-delete-data',
  OUTSTATION_VIEW_AUDIT_LOGS: 'outstation-view-audit-logs',

  OUTSTATION_VIEW_MEMBERS: 'outstation-view-members',
  OUTSTATION_MANAGE_MEMBERS: 'outstation-manage-members',

  OUTSTATION_VIEW_KARKUNS: 'outstation-view-karkuns',
  OUTSTATION_MANAGE_KARKUNS: 'outstation-manage-karkuns',

  OUTSTATION_VIEW_MESSAGES: 'outstation-view-messages',
  OUTSTATION_MANAGE_MESSAGES: 'outstation-manage-messages',
  OUTSTATION_APPROVE_MESSAGES: 'outstation-approve-messages',

  // ****************************************************************************************
  // Portals Module
  // ****************************************************************************************
  PORTALS_DELETE_DATA: 'mehfil-portals-delete-data',
  PORTALS_VIEW_AUDIT_LOGS: 'mehfil-portals-view-audit-logs',

  PORTALS_VIEW_USERS_AND_GROUPS: 'mehfil-portals-view-users-and-groups',
  PORTALS_MANAGE_USERS_AND_GROUPS: 'mehfil-portals-manage-users-and-groups',

  PORTALS_VIEW_KARKUNS: 'mehfil-portals-view-karkuns',
  PORTALS_MANAGE_KARKUNS: 'mehfil-portals-manage-karkuns',

  PORTALS_VIEW_MEMBERS: 'mehfil-portals-view-members',
  PORTALS_MANAGE_MEMBERS: 'mehfil-portals-manage-members',

  PORTALS_VIEW_AMAANAT_LOGS: 'mehfil-portals-view-amaanat-logs',
  PORTALS_MANAGE_AMAANAT_LOGS: 'mehfil-portals-manage-amaanat-logs',

  // ****************************************************************************************
  // Security Module
  // ****************************************************************************************
  SECURITY_DELETE_DATA: 'security-delete-data',
  SECURITY_MANAGE_SETUP_DATA: 'security-manage-setup-data',
  SECURITY_VIEW_AUDIT_LOGS: 'security-view-audit-logs',

  SECURITY_VIEW_KARKUN_VERIFICATION: 'security-view-karkun-verification',
  SECURITY_VIEW_VISITORS: 'security-view-visitors',
  SECURITY_MANAGE_VISITORS: 'security-manage-visitors',

  SECURITY_VIEW_SHARED_RESIDENCES: 'security-view-shared-residences',
  SECURITY_MANAGE_SHARED_RESIDENCES: 'security-manage-shared-residences',

  SECURITY_VIEW_MEHFILS: 'security-view-mehfils',
  SECURITY_MANAGE_MEHFILS: 'security-manage-mehfils',

  // ****************************************************************************************
  // Inventory Module
  // ****************************************************************************************
  IN_DELETE_DATA: 'inventory-delete-data',
  IN_MANAGE_SETUP_DATA: 'inventory-manage-setup-data',

  IN_VIEW_STOCK_ITEMS: 'inventory-view-stock-items',
  IN_MANAGE_STOCK_ITEMS: 'inventory-manage-stock-items',

  IN_VIEW_STOCK_ADJUSTMENTS: 'inventory-view-stock-adjustments',
  IN_MANAGE_STOCK_ADJUSTMENTS: 'inventory-manage-stock-adjustments',
  IN_APPROVE_STOCK_ADJUSTMENTS: 'inventory-approve-stock-adjustments',

  IN_VIEW_ISSUANCE_FORMS: 'inventory-view-issuance-forms',
  IN_MANAGE_ISSUANCE_FORMS: 'inventory-manage-issuance-forms',
  IN_APPROVE_ISSUANCE_FORMS: 'inventory-approve-issuance-forms',

  IN_VIEW_PURCHASE_FORMS: 'inventory-view-purchase-forms',
  IN_MANAGE_PURCHASE_FORMS: 'inventory-manage-purchase-forms',
  IN_APPROVE_PURCHASE_FORMS: 'inventory-approve-purchase-forms',
};

export default Permissions;
