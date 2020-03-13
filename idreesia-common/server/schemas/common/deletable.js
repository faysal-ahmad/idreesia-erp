import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  deleted: {
    type: Boolean,
    optional: true,
  },
});
