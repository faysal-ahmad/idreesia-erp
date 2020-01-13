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
  dutyCardBarcodeId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
