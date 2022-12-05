import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  createdAt: {
    type: Date,
    optional: true,
  },
  createdBy: {
    type: String,
    optional: true,
  },
  updatedAt: {
    type: Date,
    optional: true,
  },
  updatedBy: {
    type: String,
    optional: true,
  },
});
