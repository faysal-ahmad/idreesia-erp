import { default as physicalStoresAll } from './inventory/physical-stores/physical-stores-all';

Meteor.publish('inventory/physicalStores#all', physicalStoresAll);
