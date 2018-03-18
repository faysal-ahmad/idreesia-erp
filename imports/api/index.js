import { merge } from 'lodash';

import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import ItemTypeSchema from './inventory/item-type/item-type.graphql';
import ItemTypeResolvers from './inventory/item-type/resolvers';

import PhysicalStoreSchema from './inventory/physical-store/physical-store.graphql';
import PhysicalStoreResolvers from './inventory/physical-store/resolvers';

const typeDefs = [ItemCategorySchema, ItemTypeSchema, PhysicalStoreSchema];
const resolvers = merge(ItemCategoryResolvers, ItemTypeResolvers, PhysicalStoreResolvers);

// dgdfgdfgsdf

export { typeDefs, resolvers };
