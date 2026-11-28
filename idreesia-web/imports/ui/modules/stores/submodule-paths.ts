import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Reports Routes
  // *************************************************************************************
  static issuanceReportPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/issuance-report`;
  }
  static purchasingReportPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/purchasing-report`;
  }

  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static itemCategoriesPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/item-categories`;
  }
  static itemCategoriesEditFormPath(
    physicalStoreId = ':physicalStoreId',
    itemCategoryId = ':itemCategoryId'
  ) {
    return `${SubModulePaths.itemCategoriesPath(
      physicalStoreId
    )}/${itemCategoryId}`;
  }

  static locationsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/locations`;
  }
  static locationsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    locationId = ':locationId'
  ) {
    return `${SubModulePaths.locationsPath(physicalStoreId)}/${locationId}`;
  }

  static vendorsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/vendors`;
  }
  static vendorsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    vendorId = ':vendorId'
  ) {
    return `${SubModulePaths.vendorsPath(physicalStoreId)}/${vendorId}`;
  }

  // *************************************************************************************
  // Stock Items Routes
  // *************************************************************************************
  static stockItemsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/stock-items`;
  }
  static stockItemsNewFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/new`;
  }
  static stockItemsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    stockItemId = ':stockItemId'
  ) {
    return `${SubModulePaths.stockItemsPath(physicalStoreId)}/${stockItemId}`;
  }

  // *************************************************************************************
  // Issuance Forms Routes
  // *************************************************************************************
  static issuanceFormsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/issuance-forms`;
  }
  static issuanceFormsNewFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.issuanceFormsPath(physicalStoreId)}/new`;
  }
  static issuanceFormsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.issuanceFormsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static issuanceFormsViewFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.issuanceFormsPath(
      physicalStoreId
    )}/view/${formId}`;
  }
  static issuanceFormsPrintFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.issuanceFormsPath(
      physicalStoreId
    )}/print/${formId}`;
  }

  // *************************************************************************************
  // Purchase Forms Routes
  // *************************************************************************************
  static purchaseFormsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/purchase-forms`;
  }
  static purchaseFormsNewFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.purchaseFormsPath(physicalStoreId)}/new`;
  }
  static purchaseFormsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.purchaseFormsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static purchaseFormsViewFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.purchaseFormsPath(
      physicalStoreId
    )}/view/${formId}`;
  }
  static purchaseFormsPrintFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.purchaseFormsPath(
      physicalStoreId
    )}/print/${formId}`;
  }

  // *************************************************************************************
  // Stock Adjustment Routes
  // *************************************************************************************
  static stockAdjustmentsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/stock-adjustments`;
  }
  static stockAdjustmentsNewFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.stockAdjustmentsPath(physicalStoreId)}/new`;
  }
  static stockAdjustmentsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.stockAdjustmentsPath(
      physicalStoreId
    )}/edit/${formId}`;
  }
  static stockAdjustmentsViewFormPath(
    physicalStoreId = ':physicalStoreId',
    formId = ':formId'
  ) {
    return `${SubModulePaths.stockAdjustmentsPath(
      physicalStoreId
    )}/view/${formId}`;
  }

  // *************************************************************************************
  // Administration Routes
  // *************************************************************************************
  static manageStoresPath() {
    return `${ModulePaths.stores}/manage-stores`;
  }
  static manageStoresEditFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.manageStoresPath()}/${physicalStoreId}`;
  }

  // *************************************************************************************
  // Purchasing Routes (requisitions, incoming orders and goods receipts)
  // *************************************************************************************
  static requisitionsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/requisitions`;
  }
  static requisitionsNewFormPath(physicalStoreId = ':physicalStoreId') {
    return `${SubModulePaths.requisitionsPath(physicalStoreId)}/new`;
  }
  static requisitionsEditFormPath(
    physicalStoreId = ':physicalStoreId',
    requisitionId = ':requisitionId'
  ) {
    return `${SubModulePaths.requisitionsPath(physicalStoreId)}/${requisitionId}`;
  }

  static incomingOrdersPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/incoming-orders`;
  }
  static incomingOrdersViewPath(
    physicalStoreId = ':physicalStoreId',
    orderId = ':orderId'
  ) {
    return `${SubModulePaths.incomingOrdersPath(physicalStoreId)}/${orderId}`;
  }

  static goodsReceiptsPath(physicalStoreId = ':physicalStoreId') {
    return `${ModulePaths.stores}/${physicalStoreId}/goods-receipts`;
  }
  // Receiving the goods of an order.
  static goodsReceiptsNewFormPath(
    physicalStoreId = ':physicalStoreId',
    orderId = ':orderId'
  ) {
    return `${SubModulePaths.goodsReceiptsPath(physicalStoreId)}/new/${orderId}`;
  }
  static goodsReceiptsViewPath(
    physicalStoreId = ':physicalStoreId',
    receiptId = ':receiptId'
  ) {
    return `${SubModulePaths.goodsReceiptsPath(physicalStoreId)}/${receiptId}`;
  }
}
