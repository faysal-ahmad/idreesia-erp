import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  createdAt: {
    type: Date,
  },
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  updatedAt: {
    type: Date,
  },
  updatedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});
