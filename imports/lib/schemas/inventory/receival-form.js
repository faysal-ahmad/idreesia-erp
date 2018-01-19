import SimpleSchema from 'simpl-schema';

import { ItemWithQuantity } from './common';
import { approvable, identifiable, timestamps } from '../common';

export default new SimpleSchema({
  receivalDate: {
    type: Date
  },
  receivedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  submittedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  },
  items: {
    type: Array
  },
  'items.$': {
    type: ItemWithQuantity
  }
})
  .extend(approvable)
  .extend(identifiable)
  .extend(timestamps);
