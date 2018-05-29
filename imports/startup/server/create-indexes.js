import { ItemTypes } from '/imports/lib/collections/inventory';

ItemTypes.rawCollection().createIndex({ name: 'text', description: 'text' });
