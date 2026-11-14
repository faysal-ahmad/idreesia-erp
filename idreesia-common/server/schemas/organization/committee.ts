import SimpleSchema from 'simpl-schema';

import { CommitteeFeatures, CommitteeMemberRoleValues } from 'meteor/idreesia-common/constants/organization';

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
  // One of CommitteeMemberRoles: member, coordinator, guest or observer.
  'members.$.role': {
    type: String,
    allowedValues: CommitteeMemberRoleValues,
    defaultValue: 'member',
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
  // Discussions feature: the discussions workspace made for this committee.
  // Kept while the feature is disabled (the workspace is soft-deleted and its
  // chat group archived) so re-enabling restores it, with its history.
  discussionsWorkspaceId: {
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
  // Projects feature: the projects workspace made for this committee. Kept
  // while the feature is disabled (the workspace is soft-deleted and its
  // projects' chat groups archived) so re-enabling restores them.
  projectsWorkspaceId: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
