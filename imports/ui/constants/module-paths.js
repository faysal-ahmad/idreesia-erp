export class ModulePaths {
  static admin = '/admin';
  static accounts = '/accounts';
  static inventory = '/inventory';
}

export class InventorySubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemTypesPath = `${ModulePaths.inventory}/item-types`;
  static itemTypesNewFormPath = `${InventorySubModulePaths.itemTypesPath}/new`;
  static itemTypesEditFormPath = `${InventorySubModulePaths.itemTypesPath}/:itemTypeId`;

  static itemCategoriesPath = `${ModulePaths.inventory}/item-categories`;
  static itemCategoriesNewFormPath = `${InventorySubModulePaths.itemCategoriesPath}/new`;
  static itemCategoriesEditFormPath = `${
    InventorySubModulePaths.itemCategoriesPath
  }/:itemCategoryId`;

  static physicalStoresPath = `${ModulePaths.inventory}/physical-stores`;
  static physicalStoresNewFormPath = `${InventorySubModulePaths.physicalStoresPath}/new`;
  static physicalStoresEditFormPath = `${
    InventorySubModulePaths.physicalStoresPath
  }/:physicalStoreId`;

  // *************************************************************************************
  // Forms Routes
  // *************************************************************************************
  static issuanceFormsPath = `${ModulePaths.inventory}/issuance-forms`;
  static issuanceFormsNewFormPath = `${InventorySubModulePaths.issuanceFormsPath}/new`;
  static issuanceFormsEditFormPath = `${InventorySubModulePaths.issuanceFormsPath}/:formId`;

  static receivalFormsPath = `${ModulePaths.inventory}/receival-forms`;
  static receivalFormsNewFormPath = `${InventorySubModulePaths.receivalFormsPath}/new`;
  static receivalFormsEditFormPath = `${InventorySubModulePaths.receivalFormsPath}/:formId`;

  static disposalFormsPath = `${ModulePaths.inventory}/disposal-forms`;
  static disposalFormsNewFormPath = `${InventorySubModulePaths.disposalFormsPath}/new`;
  static disposalFormsEditFormPath = `${InventorySubModulePaths.disposalFormsPath}/:formId`;

  static lostItemFormsPath = `${ModulePaths.inventory}/lost-item-forms`;
  static lostItemFormsNewFormPath = `${InventorySubModulePaths.lostItemFormsPath}/new`;
  static lostItemFormsEditFormPath = `${InventorySubModulePaths.lostItemFormsPath}/:formId`;

  static purchaseOrderFormsPath = `${ModulePaths.inventory}/purchase-order-forms`;
  static purchaseOrderFormsNewFormPath = `${InventorySubModulePaths.purchaseOrderFormsPath}/new`;
  static purchaseOrderFormsEditFormPath = `${
    InventorySubModulePaths.purchaseOrderFormsPath
  }/:formId`;
}
