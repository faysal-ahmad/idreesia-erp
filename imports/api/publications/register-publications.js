import { default as itemCategoriesById } from './inventory/item-categories/by-id';
import { default as itemCategoriesAll } from './inventory/item-categories/all';
import { default as physicalStoresById } from './inventory/physical-stores/by-id';
import { default as physicalStoresAll } from './inventory/physical-stores/all';

Meteor.publish('inventory/itemCategories#byId', itemCategoriesById);
Meteor.publish('inventory/itemCategories#all', itemCategoriesAll);
Meteor.publish('inventory/physicalStores#byId', physicalStoresById);
Meteor.publish('inventory/physicalStores#all', physicalStoresAll);
