import { default as itemCategoriesById } from './inventory/item-categories/by-id';
import { default as itemCategoriesAll } from './inventory/item-categories/all';
import { default as itemStocksById } from './inventory/item-stocks/by-id';
import { default as itemStocksAll } from './inventory/item-stocks/all';
import { default as itemTypesById } from './inventory/item-types/by-id';
import { default as itemTypesAll } from './inventory/item-types/all';
import { default as physicalStoresById } from './inventory/physical-stores/by-id';
import { default as physicalStoresAll } from './inventory/physical-stores/all';

Meteor.publish('inventory/itemCategories#byId', itemCategoriesById);
Meteor.publish('inventory/itemCategories#all', itemCategoriesAll);
Meteor.publish('inventory/itemStocks#byId', itemStocksById);
Meteor.publish('inventory/itemStocks#all', itemStocksAll);
Meteor.publish('inventory/itemTypes#byId', itemTypesById);
Meteor.publish('inventory/itemTypes#all', itemTypesAll);
Meteor.publish('inventory/physicalStores#byId', physicalStoresById);
Meteor.publish('inventory/physicalStores#all', physicalStoresAll);
