import { ModulePaths } from '/imports/ui/constants';

export default class SubModulePaths {
  static stockItemsPath = `${ModulePaths.inventory}/stock-items`;
  static stockItemsNewFormPath = `${SubModulePaths.stockItemsPath}/new`;
  static stockItemsEditFormPath = `${SubModulePaths.stockItemsPath}/:stockItemId`;

  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemTypesPath = `${ModulePaths.inventory}/item-types`;
  static itemTypesNewFormPath = `${SubModulePaths.itemTypesPath}/new`;
  static itemTypesEditFormPath = `${SubModulePaths.itemTypesPath}/:itemTypeId`;

  static itemCategoriesPath = `${ModulePaths.inventory}/item-categories`;
  static itemCategoriesNewFormPath = `${SubModulePaths.itemCategoriesPath}/new`;
  static itemCategoriesEditFormPath = `${SubModulePaths.itemCategoriesPath}/:itemCategoryId`;

  static physicalStoresPath = `${ModulePaths.inventory}/physical-stores`;
  static physicalStoresNewFormPath = `${SubModulePaths.physicalStoresPath}/new`;
  static physicalStoresEditFormPath = `${SubModulePaths.physicalStoresPath}/:physicalStoreId`;

  // *************************************************************************************
  // Forms Routes
  // *************************************************************************************
  static issuanceFormsPath = `${ModulePaths.inventory}/issuance-forms`;
  static issuanceFormsNewFormPath = `${SubModulePaths.issuanceFormsPath}/new`;
  static issuanceFormsEditFormPath = `${SubModulePaths.issuanceFormsPath}/edit/:formId`;

  static receivalFormsPath = `${ModulePaths.inventory}/receival-forms`;
  static receivalFormsNewFormPath = `${SubModulePaths.receivalFormsPath}/new`;
  static receivalFormsEditFormPath = `${SubModulePaths.receivalFormsPath}/:formId`;

  static adjustmentFormsPath = `${ModulePaths.inventory}/adjustment-forms`;
  static adjustmentFormsNewFormPath = `${SubModulePaths.adjustmentFormsPath}/new`;
  static adjustmentFormsEditFormPath = `${SubModulePaths.adjustmentFormsPath}/:formId`;

  static purchaseOrderFormsPath = `${ModulePaths.inventory}/purchase-order-forms`;
  static purchaseOrderFormsNewFormPath = `${SubModulePaths.purchaseOrderFormsPath}/new`;
  static purchaseOrderFormsEditFormPath = `${SubModulePaths.purchaseOrderFormsPath}/:formId`;
}
