import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  name: {
    type: String,
    optional: true,
  },
  cnicNumber: {
    type: String,
    optional: true,
  },
  phoneNumber: {
    type: String,
    optional: true,
  },
  bloodGroup: {
    type: String,
    optional: true,
  },
  isEmployee: {
    type: Boolean,
    optional: true,
  },
  jobId: {
    type: String,
    optional: true,
  },
  dutyId: {
    type: String,
    optional: true,
  },
  dutyShiftId: {
    type: String,
    optional: true,
  },
  cityId: {
    type: String,
    optional: true,
  },
  cityMehfilId: {
    type: String,
    optional: true,
  },
  region: {
    type: String,
    optional: true,
  },
});
