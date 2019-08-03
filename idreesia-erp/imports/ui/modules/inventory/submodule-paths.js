import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemCategoriesPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/item-categories`;
  }
  static itemCategoriesNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.itemCategoriesPath(physicalStoreId)}/new`;
  }
  static itemCategoriesEditFormPath(
    physicalStoreId = ":physicalStoreId",
    itemCategoryId = ":itemCategoryId"
  ) {
    return `${SubModulePaths.itemCategoriesPath(
      physicalStoreId
    )}/${itemCategoryId}`;
  }

  static locationsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/locations`;
  }
  static locationsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.locationsPath(physicalStoreId)}/new`;
  }
  static locationsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    locationId = ":locationId"
  ) {
    return `${SubModulePaths.locationsPath(physicalStoreId)}/${locationId}`;
  }

  static vendorsPath(physicalStoreId = ":physicalStoreId") {
    return `${ModulePaths.inventory}/${physicalStoreId}/vendors`;
  }
  static vendorsNewFormPath(physicalStoreId = ":physicalStoreId") {
    return `${SubModulePaths.vendorsPath(physicalStoreId)}/new`;
  }
  static vendorsEditFormPath(
    physicalStoreId = ":physicalStoreId",
    vendorId = ":vendorId"
  ) {
    return `${SubModulePaths.vendorsPath(physicalStoreId)}/${vendorId}`;
  }

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
