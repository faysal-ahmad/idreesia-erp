import SimpleSchema from 'simpl-schema';

import { CommitteeFeatures } from 'meteor/idreesia-common/constants/hr';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  color: {
    type: String,
    optional: true,
  },
  description: {
    type: String,
    optional: true,
  },
  members: {
    type: Array,
    optional: true,
  },
  'members.$': {
    type: Object,
  },
  'members.$.karkunId': {
    type: String,
  },
  'members.$.isCoordinator': {
    type: Boolean,
    optional: true,
  },
  // Keys of the features enabled for this committee (see CommitteeFeatures).
  features: {
    type: Array,
    optional: true,
  },
  'features.$': {
    type: String,
    allowedValues: CommitteeFeatures.map(feature => feature.key),
  },
  // Discussions feature: the chat private group made for this committee. Kept
  // while the feature is disabled (the group is archived) so re-enabling
  // unarchives it instead of creating another.
  chatGroupId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
