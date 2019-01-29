export default class Permissions {
  // ****************************************************************************************
  // Admin Module
  // ****************************************************************************************
  static ADMIN_VIEW_ACCOUNTS = "admin-view-accounts";
  static ADMIN_MANAGE_ACCOUNTS = "admin-manage-accounts";

  static ADMIN_VIEW_PHYSICAL_STORES = "admin-view-physical-stores";
  static ADMIN_MANAGE_PHYSICAL_STORES = "admin-manage-physical-stores";

  static ADMIN_VIEW_FINANCIAL_ACCOUNTS = "admin-view-financial-accounts";
  static ADMIN_MANAGE_FINANCIAL_ACCOUNTS = "admin-manage-financial-accounts";

  // ****************************************************************************************
  // HR Module
  // ****************************************************************************************
  static HR_MANAGE_SETUP_DATA = "hr-manage-setup-data";
  static HR_VIEW_KARKUNS = "hr-view-karkuns";
  static HR_MANAGE_KARKUNS = "hr-manage-karkuns";

  // ****************************************************************************************
  // Inventory Module
  // ****************************************************************************************
  static IN_MANAGE_SETUP_DATA = "inventory-manage-setup-data";
  static IN_VIEW_STOCK_ITEMS = "inventory-view-stock-items";
  static IN_MANAGE_STOCK_ITEMS = "inventory-manage-stock-items";

  static IN_MANAGE_STOCK_ADJUSTMENTS = "inventory-manage-stock-adjustments";
  static IN_APPROVE_STOCK_ADJUSTMENTS = "inventory-approve-stock-adjustments";

  static IN_VIEW_ISSUANCE_FORMS = "inventory-view-issuance-forms";
  static IN_MANAGE_ISSUANCE_FORMS = "inventory-manage-issuance-forms";
  static IN_APPROVE_ISSUANCE_FORMS = "inventory-approve-issuance-forms";

  static IN_VIEW_PURCHASE_FORMS = "inventory-view-purchase-forms";
  static IN_MANAGE_PURCHASE_FORMS = "inventory-manage-purchase-forms";
  static IN_APPROVE_PURCHASE_FORMS = "inventory-approve-purchase-forms";
}
