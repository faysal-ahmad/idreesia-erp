import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  firstName: {
    type: String
  },
  lastName: {
    type: String
  }
})
  .extend(identifiable)
  .extend(timestamps);
