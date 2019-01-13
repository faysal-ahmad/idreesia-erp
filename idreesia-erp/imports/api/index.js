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
 * Schema and Resolvers for the HR module
 */
import FinancialAccountSchema from "./accounts/financial-account/financial-account.graphql";
import FinancialAccountResolvers from "./accounts/financial-account/resolvers";

const typeDefs = [
  AttachmentSchema,
  DutyLocationSchema,
  DutySchema,
  KarkunSchema,
  KarkunDutySchema,

  CommonSchema,
  ItemCategorySchema,
  ItemTypeSchema,
  PhysicalStoreSchema,
  StockItemSchema,
  IssuanceFormSchema,
  PurchaseFormSchema,
  StockAdjustmentSchema,

  FinancialAccountSchema,
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
  PhysicalStoreResolvers,
  StockItemResolvers,
  IssuanceFormResolvers,
  PurchaseFormResolvers,
  StockAdjustmentResolvers,

  FinancialAccountResolvers
);

export { typeDefs, resolvers };
