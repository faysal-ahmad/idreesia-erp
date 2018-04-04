import { merge } from 'lodash';

/**
 * Schema and Resolvers for the HR module
 */
import DutyLocationSchema from './hr/duty-location/duty-location.graphql';
import DutyLocationResolvers from './hr/duty-location/resolvers';

/**
 * Schema and Resolvers for the Inventory module
 */
import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import ItemTypeSchema from './inventory/item-type/item-type.graphql';
import ItemTypeResolvers from './inventory/item-type/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store.graphql';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

const typeDefs = [DutyLocationSchema, ItemCategorySchema, ItemTypeSchema, PhysicalStoreSchema];
const resolvers = merge(
  DutyLocationResolvers,
  ItemCategoryResolvers,
  ItemTypeResolvers,
  PhysicalStoreResolvers
);

// sadsadsdfsdsdsd

export { typeDefs, resolvers };
