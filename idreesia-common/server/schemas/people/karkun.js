import SimpleSchema from 'simpl-schema';

export default new SimpleSchema({
  // Id from the Karkun collection when imported
  karkunId: {
    type: String,
    optional: true,
  },

  orgLocationId: {
    type: String,
    optional: true,
  },
  // ***************************
  // These will be deprecated once we populate the orgLocationId
  cityId: {
    type: String,
    optional: true,
  },
  cityMehfilId: {
    type: String,
    optional: true,
  },
  // ***************************
  lastTarteebDate: {
    type: Date,
    optional: true,
  },
  mehfilRaabta: {
    type: String,
    optional: true,
  },
  msRaabta: {
    type: String,
    optional: true,
  },
  msLastVisitDate: {
    type: Date,
    optional: true,
  },
  ehadKarkun: {
    type: Boolean,
    optional: true,
  },
  ehadPermissionDate: {
    type: Date,
    optional: true,
  },
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
  },
});
