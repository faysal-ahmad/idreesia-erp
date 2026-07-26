import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  approvedOn: {
    type: Date,
    optional: true,
  },
  approvedBy: {
    type: String,
    optional: true,
  },
});
