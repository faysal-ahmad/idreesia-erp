import SimpleSchema from 'simpl-schema';
import { identifiable, timestamps } from '../common';
import WazeefaWithQuantity from './wazeefa-with-quantity';

export default new SimpleSchema({
  vendorId: {
    type: String,
  },
  orderDate: {
    type: Date,
  },
  orderedBy: {
    type: String,
  },
  deliveryDate: {
    type: Date,
    optional: true,
  },
  receivedBy: {
    type: String,
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
