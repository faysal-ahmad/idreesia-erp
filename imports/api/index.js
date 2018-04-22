import { merge } from 'lodash';

/**
 * Schema and Resolvers for the HR module
 */
import DutyLocationSchema from './hr/duty-location/duty-location.graphql';
import DutyLocationResolvers from './hr/duty-location/resolvers';

import DutySchema from './hr/duty/duty.graphql';
import DutyResolvers from './hr/duty/resolvers';

import KarkunSchema from './hr/karkuns/karkun.graphql';
import KarkunResolvers from './hr/karkuns/resolvers';

/**
 * Schema and Resolvers for the Inventory module
 */
import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import ItemTypeSchema from './inventory/item-type/item-type.graphql';
import ItemTypeResolvers from './inventory/item-type/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store.graphql';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

const typeDefs = [
  DutyLocationSchema,
  DutySchema,
  KarkunSchema,
  ItemCategorySchema,
  ItemTypeSchema,
  PhysicalStoreSchema
];
const resolvers = merge(
  DutyLocationResolvers,
  DutyResolvers,
  KarkunResolvers,
  ItemCategoryResolvers,
  ItemTypeResolvers,
  PhysicalStoreResolvers
);

// werdasdsdfsdf

export { typeDefs, resolvers };
