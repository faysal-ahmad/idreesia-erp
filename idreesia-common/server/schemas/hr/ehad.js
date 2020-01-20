import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';

export default new SimpleSchema({
  name: {
    type: String,
  },
  fatherName: {
    type: String,    
  },
  city: {
    type: String,
  },
  marfat: {
    type: String,    
  },
  phoneNumber: {
    type: String,
  },  
  cnicNumber: {
    type: String,
    optional: true,
  },  
})
  .extend(identifiable)
  .extend(timestamps);
