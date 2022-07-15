import SimpleSchema from 'simpl-schema';

import WazeefaDetail from './wazeefa-detail';
import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  revisionNumber: {
    type: Number,
    optional: true,
  },
  revisionDate: {
    type: Date,
    optional: true,
  },
  wazeefaDetail: {
    type: WazeefaDetail,
    optional: true,
  },
  imageIds: {
    type: Array,
    optional: true,
  },
  'imageIds.$': {
    type: String,
    optional: true,
  },
  startingStockLevel: {
    type: Number,
    optional: true,
  },
  currentStockLevel: {
    type: Number,
    optional: true,
  },
  stockVerifiedOn: {
    type: Date,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
