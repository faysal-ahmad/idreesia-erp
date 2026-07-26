import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  jobId: {
    type: String,
    optional: true,
  },
  employmentStartDate: {
    type: Date,
    optional: true,
  },
  employmentEndDate: {
    type: Date,
    optional: true,
  },
  bankAccountDetails: {
    type: String,
    optional: true,
  },
});
