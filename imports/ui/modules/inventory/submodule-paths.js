import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemTypesPath = `${ModulePaths.inventory}/item-types`;
  static itemTypesNewFormPath = `${SubModulePaths.itemTypesPath}/new`;
  static itemTypesEditFormPath = `${SubModulePaths.itemTypesPath}/:itemTypeId`;

  static itemCategoriesPath = `${ModulePaths.inventory}/item-categories`;
  static itemCategoriesNewFormPath = `${SubModulePaths.itemCategoriesPath}/new`;
  static itemCategoriesEditFormPath = `${
    SubModulePaths.itemCategoriesPath
  }/:itemCategoryId`;

  // *************************************************************************************
  // Stock Items Routes
  // *************************************************************************************
  static stockItemsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/stock-items`;
  }
  static stockItemsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/new`;
  }
  static stockItemsEditFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/:stockItemId`;
  }

  // *************************************************************************************
  // Issuance Forms Routes
  // *************************************************************************************
  static issuanceFormsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/issuance-forms`;
  }
  static issuanceFormsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.issuanceFormsPath(physicalStoreId)}/new`;
  }
  static issuanceFormsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.issuanceFormsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static issuanceFormsViewFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.issuanceFormsPath(
      physicalStoreId
    )}/view/${formId}`;
  }

  // *************************************************************************************
  // Purchase Forms Routes
  // *************************************************************************************
  static purchaseFormsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/purchase-forms`;
  }
  static purchaseFormsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.purchaseFormsPath(physicalStoreId)}/new`;
  }
  static purchaseFormsEditFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.purchaseFormsPath(physicalStoreId)}/:formId`;
  }
}
