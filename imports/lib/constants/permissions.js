export default class Permissions {
  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  static ADMIN_VIEW_ACCOUNTS = 'admin-view-accounts';
  static ADMIN_MANAGE_ACCOUNTS = 'admin-manage-accounts';

  // ****************************************************************************************
  // HR Module
  // ****************************************************************************************
  static HR_MANAGE_SETUP_DATA = 'hr-manage-setup-data';
  static HR_VIEW_KARKUNS = 'hr-view-karkuns';
  static HR_MANAGE_KARKUNS = 'hr-manage-karkuns';
  static HR_MANAGE_KARKUN_DUTIES = 'hr-manage-karkun-duties';

  // ****************************************************************************************
  // Inventory Module
  // ****************************************************************************************
  static IN_MANAGE_SETUP_DATA = 'inventory-manage-setup-data';
  static IN_VIEW_STOCK_ITEMS = 'inventory-view-stock-items';
  static IN_MANAGE_STOCK_ITEMS = 'inventory-manage-stock-items';
  static IN_APPROVE_STOCK_MODIFICATIONS = 'inventory-approve-stock-modifications';

  static IN_MANAGE_ISSUANCE_FORMS = 'inventory-manage-issuance-forms';
  static IN_APPROVE_ISSUANCE_FORMS = 'inventory-approve-issuance-forms';
  static IN_MANAGE_RECEIVAL_FORMS = 'inventory-manage-receival-forms';
  static IN_APPROVE_RECEIVAL_FORMS = 'inventory-approve-receival-forms';
}
