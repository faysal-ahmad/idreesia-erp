import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  mehfilId: {
    type: String,
  },
  karkunId: {
    type: String,
  },
  dutyName: {
    type: String,
  },
  dutyDetail: {
    type: String,
    optional: true,
  },
  dutyCardBarcodeId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
