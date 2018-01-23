import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String
  },
  description: {
    type: String
  }
})
  .extend(identifiable)
  .extend(timestamps);
