import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  city: {
    type: String,
    optional: true,
  },
  country: {
    type: String,
    optional: true,
  },
  criminalRecord: {
    type: String,
    optional: true,
  },
  otherNotes: {
    type: String,
    optional: true,
  },
});
