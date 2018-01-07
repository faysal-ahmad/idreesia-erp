import { default as physicalStoresById } from './inventory/physical-stores/physical-stores-by-id';
import { default as physicalStoresAll } from './inventory/physical-stores/physical-stores-all';

Meteor.publish('inventory/physicalStores#byId', physicalStoresById);
Meteor.publish('inventory/physicalStores#all', physicalStoresAll);
