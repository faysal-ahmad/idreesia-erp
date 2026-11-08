import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  workspaceId: {
    type: String,
  },
  pollId: {
    type: String,
  },
  // Opaque id chosen by the caller (e.g. a karkun id). Kept for anonymous
  // polls too, so votes can be changed and counted once; the module never
  // returns it for an anonymous poll's results.
  voterId: {
    type: String,
  },
  answers: {
    type: Array,
  },
  'answers.$': {
    type: Object,
  },
  'answers.$.questionId': {
    type: String,
  },
  'answers.$.optionIds': {
    type: Array,
  },
  'answers.$.optionIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
