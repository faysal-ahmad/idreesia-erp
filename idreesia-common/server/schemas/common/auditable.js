import SimpleSchema from 'simpl-schema';

/*
  const AuditValue = new SimpleSchema({
    fieldName: {
      type: String,
    },
    changedFrom: {
      type: String,
      optional: true,
    },
    changedTo: {
      type: String,
      optional: true,
    },
  });
*/

const AuditValueCollection = new SimpleSchema({
  auditValues: {
    type: Array,
    optional: true,
  },
  'auditValues.$': {
    type: Object,
    blackbox: true,
  },
  changedOn: {
    type: Date,
  },
  changedBy: {
    type: String,
  },
});

export default new SimpleSchema({
  auditLog: {
    type: Array,
    optional: true,
  },
  'auditLog.$': {
    type: AuditValueCollection,
  },
});
