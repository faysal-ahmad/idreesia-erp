import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  locationId: {
    type: String,
  },
  userId: {
    type: String,
  },
  // Everything the user may do on the location, in the stored form
  // `<group>.<permission>`: the group is `location` or a feature key, e.g.
  // `duties-attendance.view`.
  permissions: {
    type: Array,
  },
  'permissions.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
