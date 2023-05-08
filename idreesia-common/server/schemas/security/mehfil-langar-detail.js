import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  mehfilId: {
    type: String,
  },
  langarDishId: {
    type: String,
  },
  langarLocationId: {
    type: String,
  },
  quantity: {
    type: Number,
  },
})
  .extend(identifiable)
  .extend(timestamps);
