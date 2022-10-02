import SimpleSchema from 'simpl-schema';
import { identifiable, timestamps } from '../common';
import WazeefaWithQuantity from './wazeefa-with-quantity';

export default new SimpleSchema({
  cityId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  cityMehfilId: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  requestedDate: {
    type: Date,
  },
  requestedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
  },
  deliveryDate: {
    type: Date,
    optional: true,
  },
  deliveryTo: {
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
