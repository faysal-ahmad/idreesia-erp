import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  _id: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  name: {
    type: String,
    optional: false,
  },
  data: {
    type: String,
    optional: false,
  },
});
