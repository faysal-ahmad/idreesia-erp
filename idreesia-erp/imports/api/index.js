import { merge } from "lodash";

/**
 * Common Schema and Resolvers
 */
import AttachmentSchema from "./common/attachments/attachment.graphql";
import AttachmentResolvers from "./common/attachments/resolvers";

/**
 * Schema and Resolvers for the HR module
 */
import DutyLocationSchema from "./hr/duty-location/duty-location.graphql";
import DutyLocationResolvers from "./hr/duty-location/resolvers";

import DutySchema from "./hr/duty/duty.graphql";
import DutyResolvers from "./hr/duty/resolvers";

import KarkunSchema from "./hr/karkuns/karkun.graphql";
import KarkunResolvers from "./hr/karkuns/resolvers";

import KarkunDutySchema from "./hr/karkun-duties/karkun-duty.graphql";
import KarkunDutyResolvers from "./hr/karkun-duties/resolvers";

/**
 * Schema and Resolvers for the Inventory module
 */
import CommonSchema from "./inventory/common/common.graphql";
import CommonResolvers from "./inventory/common/resolvers";

import ItemCategorySchema from "./inventory/item-category/item-category.graphql";
import ItemCategoryResolvers from "./inventory/item-category/resolvers";

import ItemTypeSchema from "./inventory/item-type/item-type.graphql";
import ItemTypeResolvers from "./inventory/item-type/resolvers";

import LocationSchema from "./inventory/location/location.graphql";
import LocationResolvers from "./inventory/location/resolvers";

import PhysicalStoreSchema from "./inventory/physical-store/physical-store.graphql";
import PhysicalStoreResolvers from "./inventory/physical-store/resolvers";

import StockItemSchema from "./inventory/stock-item/stock-item.graphql";
import StockItemResolvers from "./inventory/stock-item/resolvers";

import IssuanceFormSchema from "./inventory/issuance-form/issuance-form.graphql";
import IssuanceFormResolvers from "./inventory/issuance-form/resolvers";

import PurchaseFormSchema from "./inventory/purchase-form/purchase-form.graphql";
import PurchaseFormResolvers from "./inventory/purchase-form/resolvers";

import StockAdjustmentSchema from "./inventory/stock-adjustment/stock-adjustment.graphql";
import StockAdjustmentResolvers from "./inventory/stock-adjustment/resolvers";

/**
 * Schema and Resolvers for the Accounts module
 */
import CompanySchema from "./accounts/company/company.graphql";
import CompanyResolvers from "./accounts/company/resolvers";

import DataImportSchema from "./accounts/data-import/data-import.graphql";
import DataImportResolvers from "./accounts/data-import/resolvers";

import AccountHeadSchema from "./accounts/account-head/account-head.graphql";
import AccountHeadResolvers from "./accounts/account-head/resolvers";

import VoucherSchema from "./accounts/voucher/voucher.graphql";
import VoucherResolvers from "./accounts/voucher/resolvers";

import VoucherDetailSchema from "./accounts/voucher-detail/voucher-detail.graphql";
import VoucherDetailResolvers from "./accounts/voucher-detail/resolvers";

const typeDefs = [
  AttachmentSchema,
  DutyLocationSchema,
  DutySchema,
  KarkunSchema,
  KarkunDutySchema,

  CommonSchema,
  ItemCategorySchema,
  ItemTypeSchema,
  LocationSchema,
  PhysicalStoreSchema,
  StockItemSchema,
  IssuanceFormSchema,
  PurchaseFormSchema,
  StockAdjustmentSchema,

  AccountHeadSchema,
  CompanySchema,
  DataImportSchema,
  VoucherSchema,
  VoucherDetailSchema,
];

const resolvers = merge(
  AttachmentResolvers,

  DutyLocationResolvers,
  DutyResolvers,
  KarkunResolvers,
  KarkunDutyResolvers,

  CommonResolvers,
  ItemCategoryResolvers,
  ItemTypeResolvers,
  LocationResolvers,
  PhysicalStoreResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers,

  AccountHeadResolvers,
  CompanyResolvers,
  DataImportResolvers,
  VoucherResolvers,
  VoucherDetailResolvers
);

export { typeDefs, resolvers };
