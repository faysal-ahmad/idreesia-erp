import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  approvedOn: {
    type: Date
  },
  approvedBy: {
    type: String,
    regEx: SimpleSchema.RegEx.Id
  }
});
