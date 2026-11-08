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
  // Documents feature: the DMS workspace made for this committee. Kept while
  // the feature is disabled (the workspace is soft-deleted) so re-enabling
  // restores it, with its documents, instead of creating another.
  dmsWorkspaceId: {
    type: String,
    optional: true,
  },
  // Meetings feature: the meetings workspace made for this committee. Kept
  // while the feature is disabled (the workspace is soft-deleted) so
  // re-enabling restores it, with its meetings.
  meetingsWorkspaceId: {
    type: String,
    optional: true,
  },
  // Polls feature: the polls workspace made for this committee. Kept while
  // the feature is disabled (the workspace is soft-deleted) so re-enabling
  // restores it, with its polls.
  pollsWorkspaceId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
