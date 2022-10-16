import SimpleSchema from 'simpl-schema';
import { identifiable, timestamps } from '../common';
import WazeefaWithQuantity from './wazeefa-with-quantity';

export default new SimpleSchema({
  vendorId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  orderDate: {
    type: Date,
  },
  orderedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  deliveryDate: {
    type: Date,
    optional: true,
  },
  receivedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  items: {
    type: Array,
  },
  'items.$': {
    type: WazeefaWithQuantity,
  },
  status: {
    type: String,
    allowedValues: ['pending', 'completed'],
    optional: true,
  },
  notes: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
