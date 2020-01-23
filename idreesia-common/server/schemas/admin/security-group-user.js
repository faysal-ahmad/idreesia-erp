import SimpleSchema from 'simpl-schema';

import { identifiable } from '../common';

export default new SimpleSchema({
  groupId: {
    type: String,
  },
  userId: {
    type: String,
  },
}).extend(identifiable);
