import SimpleSchema from 'simpl-schema';

import {
  PollQuestionType,
  PollStatus,
} from 'meteor/idreesia-common/constants/polls';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
    optional: true,
  },
  tags: {
    type: Array,
  },
  'tags.$': {
    type: String,
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true,
  },
  // Results never name voters. Fixed once the poll is opened.
  anonymous: {
    type: Boolean,
  },
  showResultsWhileOpen: {
    type: Boolean,
  },
  // Opaque ids chosen by the caller (e.g. karkun ids). Unset means anyone
  // the caller lets through can vote.
  eligibleVoterIds: {
    type: Array,
    optional: true,
  },
  'eligibleVoterIds.$': {
    type: String,
  },
  // Array order is the order questions are shown in.
  questions: {
    type: Array,
  },
  'questions.$': {
    type: Object,
  },
  'questions.$._id': {
    type: String,
  },
  'questions.$.text': {
    type: String,
  },
  'questions.$.description': {
    type: String,
    optional: true,
  },
  'questions.$.type': {
    type: String,
    allowedValues: Object.values(PollQuestionType),
  },
  'questions.$.required': {
    type: Boolean,
  },
  'questions.$.minChoices': {
    type: SimpleSchema.Integer,
    optional: true,
    min: 1,
  },
  'questions.$.maxChoices': {
    type: SimpleSchema.Integer,
    optional: true,
    min: 1,
  },
  'questions.$.options': {
    type: Array,
  },
  'questions.$.options.$': {
    type: Object,
  },
  'questions.$.options.$._id': {
    type: String,
  },
  'questions.$.options.$.text': {
    type: String,
  },
  closesAt: {
    type: Date,
  },
  status: {
    type: String,
    allowedValues: Object.values(PollStatus),
  },
  openedAt: {
    type: Date,
    optional: true,
  },
  openedBy: {
    type: String,
    optional: true,
  },
  closedAt: {
    type: Date,
    optional: true,
  },
  // Unset when the poll closed on its own at closesAt.
  closedBy: {
    type: String,
    optional: true,
  },
  cancelledAt: {
    type: Date,
    optional: true,
  },
  cancelledBy: {
    type: String,
    optional: true,
  },
  cancellationReason: {
    type: String,
    optional: true,
  },
  // Number of ballots. No `min`: it changes by $inc -1.
  voteCount: {
    type: SimpleSchema.Integer,
  },
  // Bumped on every change, so concurrent read-modify-write updates can't
  // overwrite each other.
  revision: {
    type: SimpleSchema.Integer,
    min: 0,
  },
})
  .extend(identifiable)
  .extend(timestamps);
