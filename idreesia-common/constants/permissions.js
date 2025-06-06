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

  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  ADMIN_VIEW_ADMIN_JOBS: 'admin-view-admin-jobs',
  ADMIN_MANAGE_ADMIN_JOBS: 'admin-manage-admin-jobs',

  ADMIN_VIEW_USERS_AND_GROUPS: 'admin-view-users-and-groups',
  ADMIN_MANAGE_USERS_AND_GROUPS: 'admin-manage-users-and-groups',

  ADMIN_MANAGE_PHYSICAL_STORES: 'admin-manage-physical-stores',

  ADMIN_VIEW_COMPANIES: 'admin-view-companies',
  ADMIN_MANAGE_COMPANIES: 'admin-manage-companies',

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

  // ****************************************************************************************
  // Operations Module
  // ****************************************************************************************
  OP_MANAGE_SETUP_DATA: 'operations-manage-setup-data',
  OP_DELETE_DATA: 'operations-delete-data',

  OP_VIEW_VISITORS: 'operations-view-visitors',
  OP_MANAGE_VISITORS: 'operations-manage-visitors',

  OP_VIEW_IMDAD_REQUESTS: 'operations-view-imdad-requests',
  OP_MANAGE_IMDAD_REQUESTS: 'operations-manage-imdad-requests',

  OP_WAZAIF_VIEW_DATA: 'operations-wazaif-view-data',
  OP_WAZAIF_MANAGE_DATA: 'operations-wazaif-manage-data',
  OP_WAZAIF_APPROVE_DATA: 'operations-wazaif-approve-data',
  OP_WAZAIF_VIEW_SETUP_DATA: 'operations-wazaif-view-setup-data',
  OP_WAZAIF_MANAGE_SETUP_DATA: 'operations-wazaif-manage-setup-data',
  OP_WAZAIF_VIEW_SECURITY_DATA: 'operations-wazaif-view-security-data',
  OP_WAZAIF_MANAGE_SECURITY_DATA: 'operations-wazaif-manage-security-data',

  // ****************************************************************************************
  // Outstation Module
  // ****************************************************************************************
  OUTSTATION_MANAGE_SETUP_DATA: 'outstation-manage-setup-data',
  OUTSTATION_DELETE_DATA: 'outstation-delete-data',

  OUTSTATION_VIEW_MEMBERS: 'outstation-view-members',
  OUTSTATION_MANAGE_MEMBERS: 'outstation-manage-members',

  OUTSTATION_VIEW_KARKUNS: 'outstation-view-karkuns',
  OUTSTATION_MANAGE_KARKUNS: 'outstation-manage-karkuns',

  OUTSTATION_VIEW_PORTAL_USERS_AND_GROUPS:
    'outstation-view-portal-users-and-groups',
  OUTSTATION_MANAGE_PORTAL_USERS_AND_GROUPS:
    'outstation-manage-portal-users-and-groups',

  // ****************************************************************************************
  // Portals Module
  // ****************************************************************************************
  PORTALS_VIEW_MEMBERS: 'mehfil-portals-view-members',
  PORTALS_MANAGE_MEMBERS: 'mehfil-portals-manage-members',

  PORTALS_VIEW_KARKUNS: 'mehfil-portals-view-karkuns',
  PORTALS_MANAGE_KARKUNS: 'mehfil-portals-manage-karkuns',
  PORTALS_MANAGE_KARKUN_ATTENDANCES: 'mehfil-portals-manage-karkun-attendances',

  PORTALS_VIEW_USERS_AND_GROUPS: 'mehfil-portals-view-users-and-groups',
  PORTALS_MANAGE_USERS_AND_GROUPS: 'mehfil-portals-manage-users-and-groups',

  PORTALS_VIEW_AMAANAT_LOGS: 'mehfil-portals-view-amaanat-logs',
  PORTALS_MANAGE_AMAANAT_LOGS: 'mehfil-portals-manage-amaanat-logs',

  PORTALS_VIEW_AUDIT_LOGS: 'mehfil-portals-view-audit-logs',

  // ****************************************************************************************
  // Security Module
  // ****************************************************************************************
  SECURITY_DELETE_DATA: 'security-delete-data',
  SECURITY_MANAGE_SETUP_DATA: 'security-manage-setup-data',
  SECURITY_VIEW_AUDIT_LOGS: 'security-view-audit-logs',
  SECURITY_VIEW_USERS: 'security-view-users',
  SECURITY_MANAGE_USERS: 'security-manage-users',

  SECURITY_VIEW_KARKUN_VERIFICATION: 'security-view-karkun-verification',
  SECURITY_VIEW_VISITORS: 'security-view-visitors',
  SECURITY_MANAGE_VISITORS: 'security-manage-visitors',

  SECURITY_VIEW_MEHFILS: 'security-view-mehfils',
  SECURITY_MANAGE_MEHFILS: 'security-manage-mehfils',

  // ****************************************************************************************
  // Inventory Module
  // ****************************************************************************************
  IN_MANAGE_SETUP_DATA: 'inventory-manage-setup-data',
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
