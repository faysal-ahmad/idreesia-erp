import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  // A free-form city name, exactly as recorded on visitors.
  city: {
    type: String,
  },
  // The organization location the city maps to.
  locationId: {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
