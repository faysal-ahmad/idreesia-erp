import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  // The chat private group behind this workspace. Internal to the
  // discussions module; callers only ever see the workspace id.
  chatGroupId: {
    type: String,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
