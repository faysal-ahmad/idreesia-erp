import { merge } from 'lodash';

import ItemCategorySchema from './inventory/item-category/item-category.graphql';
import ItemCategoryResolvers from './inventory/item-category/resolvers';

import ItemTypeSchema from './inventory/item-type/item-type.graphql';
import ItemTypeResolvers from './inventory/item-type/resolvers';

const typeDefs = [ItemCategorySchema, ItemTypeSchema];
const resolvers = merge(ItemCategoryResolvers, ItemTypeResolvers);

// dgdfgdfg

export { typeDefs, resolvers };
