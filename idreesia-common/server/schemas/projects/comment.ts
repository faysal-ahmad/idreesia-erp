import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  taskId: {
    type: String,
  },
  // Opaque id of the author, chosen by the caller.
  authorId: {
    type: String,
  },
  text: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
