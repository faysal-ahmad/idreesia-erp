const Permissions = {
  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  ADMIN_VIEW_USERS_AND_GROUPS: 'admin-view-users-and-groups',
  ADMIN_MANAGE_USERS_AND_GROUPS: 'admin-manage-users-and-groups',

  ADMIN_MANAGE_PHYSICAL_STORES: 'admin-manage-physical-stores',
  ADMIN_MANAGE_CITIES: 'admin-manage-cities',

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
