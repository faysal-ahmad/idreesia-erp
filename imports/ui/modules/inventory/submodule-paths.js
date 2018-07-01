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

  // *************************************************************************************
  // Forms Routes
  // *************************************************************************************
  static issuanceFormsPath = `${ModulePaths.inventory}/issuance-forms`;
  static issuanceFormsNewFormPath = `${SubModulePaths.issuanceFormsPath}/new`;
  static issuanceFormsEditFormPath = `${SubModulePaths.issuanceFormsPath}/:formId`;

  static returnFormsPath = `${ModulePaths.inventory}/return-forms`;
  static returnFormsNewFormPath = `${SubModulePaths.returnFormsPath}/new`;
  static returnFormsEditFormPath = `${SubModulePaths.returnFormsPath}/:formId`;

  static purchaseFormsPath = `${ModulePaths.inventory}/purchase-forms`;
  static purchaseFormsNewFormPath = `${SubModulePaths.purchaseFormsPath}/new`;
  static purchaseFormsEditFormPath = `${SubModulePaths.purchaseFormsPath}/:formId`;
}
