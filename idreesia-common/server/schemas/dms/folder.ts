import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  // Unset for a folder at the workspace root.
  parentId: {
    type: String,
    optional: true,
  },
  // Ids of every folder above this one, root first.
  ancestorIds: {
    type: Array,
  },
  'ancestorIds.$': {
    type: String,
  },
  name: {
    type: String,
  },
  // Lower-cased name, for case-insensitive uniqueness among siblings.
  nameLower: {
    type: String,
  },
  trashed: {
    type: Boolean,
  },
  // Id of the item whose trashing trashed this one (itself, a folder above).
  trashRootId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
