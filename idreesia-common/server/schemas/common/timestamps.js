import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  createdAt: {
    type: Date,
    optional: true,
  },
  createdBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  updatedAt: {
    type: Date,
    optional: true,
  },
  updatedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
});
