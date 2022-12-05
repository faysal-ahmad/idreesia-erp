import SimpleSchema from 'simpl-schema';
import { identifiable, timestamps } from '../common';
import WazeefaWithQuantity from './wazeefa-with-quantity';

export default new SimpleSchema({
  cityId: {
    type: String,
  },
  cityMehfilId: {
    type: String,
    optional: true,
  },
  requestedDate: {
    type: Date,
  },
  requestedBy: {
    type: String,
  },
  deliveryDate: {
    type: Date,
    optional: true,
  },
  deliveryTo: {
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
