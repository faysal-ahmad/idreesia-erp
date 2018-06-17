import { merge } from 'lodash';

/**
 * Schema and Resolvers for the Admin module
 */
// import AccountSchema from './admin/account/account.graphql';
// import AccountResolvers from './admin/account/resolvers';

/**
 * Schema and Resolvers for the HR module
 */
import DutyLocationSchema from './hr/duty-location/duty-location.graphql';
import DutyLocationResolvers from './hr/duty-location/resolvers';

import DutySchema from './hr/duty/duty.graphql';
import DutyResolvers from './hr/duty/resolvers';

import KarkunSchema from './hr/karkuns/karkun.graphql';
import KarkunResolvers from './hr/karkuns/resolvers';

import KarkunDutySchema from './hr/karkun-duties/karkun-duty.graphql';
import KarkunDutyResolvers from './hr/karkun-duties/resolvers';

/**
 * Schema and Resolvers for the Inventory module
 */
import CommonSchema from './inventory/common/common.graphql';
import CommonResolvers from './inventory/common/resolvers';

import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import ItemTypeSchema from './inventory/item-type/item-type.graphql';
import ItemTypeResolvers from './inventory/item-type/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store.graphql';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

import StockItemSchema from './inventory/stock-item/stock-item.graphql';
import StockItemResolvers from './inventory/stock-item/resolvers';

import IssuanceFormSchema from './inventory/issuance-form/issuance-form.graphql';
import IssuanceFormResolvers from './inventory/issuance-form/resolvers';

import ReturnFormSchema from './inventory/return-form/return-form.graphql';
import ReturnFormResolvers from './inventory/return-form/resolvers';

const typeDefs = [
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
  ReturnFormSchema,
];

const resolvers = merge(
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
  ReturnFormResolvers
);

// werwerefdgfdgdgd

export { typeDefs, resolvers };
