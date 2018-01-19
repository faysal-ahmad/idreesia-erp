export class ModulePaths {
  static admin = '/admin';
  static accounts = '/accounts';
  static inventory = '/inventory';
}

export class InventorySubModulePaths {
  static stockItemsPath = `${ModulePaths.inventory}/stock-items`;
  static stockItemsNewFormPath = `${InventorySubModulePaths.stockItemsPath}/new`;
  static stockItemsEditFormPath = `${InventorySubModulePaths.stockItemsPath}/:stockItemId`;

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
  static issuanceFormsListPath = `${InventorySubModulePaths.issuanceFormsPath}/list/:pageId`;
  static issuanceFormsNewFormPath = `${InventorySubModulePaths.issuanceFormsPath}/new`;
  static issuanceFormsEditFormPath = `${InventorySubModulePaths.issuanceFormsPath}/edit/:formId`;

  static receivalFormsPath = `${ModulePaths.inventory}/receival-forms`;
  static receivalFormsListPath = `${InventorySubModulePaths.receivalFormsPath}/list/:pageId`;
  static receivalFormsNewFormPath = `${InventorySubModulePaths.receivalFormsPath}/new`;
  static receivalFormsEditFormPath = `${InventorySubModulePaths.receivalFormsPath}/:formId`;

  static disposalFormsPath = `${ModulePaths.inventory}/disposal-forms`;
  static disposalFormsListPath = `${InventorySubModulePaths.disposalFormsPath}/list/:pageId`;
  static disposalFormsNewFormPath = `${InventorySubModulePaths.disposalFormsPath}/new`;
  static disposalFormsEditFormPath = `${InventorySubModulePaths.disposalFormsPath}/:formId`;

  static lostItemFormsPath = `${ModulePaths.inventory}/lost-item-forms`;
  static lostItemFormsListPath = `${InventorySubModulePaths.lostItemFormsPath}/list/:pageId`;
  static lostItemFormsNewFormPath = `${InventorySubModulePaths.lostItemFormsPath}/new`;
  static lostItemFormsEditFormPath = `${InventorySubModulePaths.lostItemFormsPath}/:formId`;

  static purchaseOrderFormsPath = `${ModulePaths.inventory}/purchase-order-forms`;
  static purchaseOrderFormsListPath = `${
    InventorySubModulePaths.purchaseOrderFormsPath
  }/list/:pageId`;
  static purchaseOrderFormsNewFormPath = `${InventorySubModulePaths.purchaseOrderFormsPath}/new`;
  static purchaseOrderFormsEditFormPath = `${
    InventorySubModulePaths.purchaseOrderFormsPath
  }/:formId`;
}
