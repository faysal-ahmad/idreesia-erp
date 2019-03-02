import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemCategoriesPath = `${ModulePaths.inventory}/item-categories`;
  static itemCategoriesNewFormPath = `${SubModulePaths.itemCategoriesPath}/new`;
  static itemCategoriesEditFormPath = `${
    SubModulePaths.itemCategoriesPath
  }/:itemCategoryId`;

  static locationsPath = `${ModulePaths.inventory}/locations`;
  static locationsNewFormPath = `${SubModulePaths.locationsPath}/new`;
  static locationsEditFormPath = `${SubModulePaths.locationsPath}/:locationId`;

  // *************************************************************************************
  // Stock Items Routes
  // *************************************************************************************
  static stockItemsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/stock-items`;
  }
  static stockItemsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/new`;
  }
  static stockItemsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    stockItemId = ":stockItemId"
  ) {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/${stockItemId}`;
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
  static purchaseFormsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.purchaseFormsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static purchaseFormsViewFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.purchaseFormsPath(
      physicalStoreId
    )}/view/${formId}`;
  }

  // *************************************************************************************
  // Stock Adjustment Routes
  // *************************************************************************************
  static stockAdjustmentsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/stock-adjustments`;
  }
  static stockAdjustmentsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.stockAdjustmentsPath(physicalStoreId)}/new`;
  }
  static stockAdjustmentsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.stockAdjustmentsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static stockAdjustmentsViewFormPath(
    physicalStoreId = ":physicalStoreId",
    formId = ":formId"
  ) {
    return `${SubModulePaths.stockAdjustmentsPath(
      physicalStoreId
    )}/view/${formId}`;
  }
}
