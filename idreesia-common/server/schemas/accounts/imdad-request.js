import SimpleSchema from 'simpl-schema';

import { values } from 'meteor/idreesia-common/utilities/lodash';
import { DataSource } from 'meteor/idreesia-common/constants';
import { ImdadRequestStatus } from 'meteor/idreesia-common/constants/accounts';
import { identifiable, timestamps } from '../common';

const ApprovedImdad = new SimpleSchema({
  fromMonth: {
    type: String,
    optional: true,
  },
  toMonth: {
    type: String,
    optional: true,
  },
  oneOffMedical: {
    type: Number,
    optional: true,
  },
  oneOffHouseConstruction: {
    type: Number,
    optional: true,
  },
  oneOffMarriageExpense: {
    type: Number,
    optional: true,
  },
  oneOffMiscPayment: {
    type: Number,
    optional: true,
  },
  fixedRecurringWeeklyPayment: {
    type: Number,
    optional: true,
  },
  fixedRecurringMonthlyPayment: {
    type: Number,
    optional: true,
  },
  fixedRecurringHouseRent: {
    type: Number,
    optional: true,
  },
  ration: {
    type: String,
    optional: true,
    allowedValues: ['none', 'small', 'large'],
  },
  fixedRecurringMedical: {
    type: Number,
    optional: true,
  },
  fixedRecurringSchoolFee: {
    type: Number,
    optional: true,
  },
  fixedRecurringMilk: {
    type: Number,
    optional: true,
  },
  fixedRecurringFuel: {
    type: Number,
    optional: true,
  },
  variableRecurringMedical: {
    type: Number,
    optional: true,
  },
  variableRecurringUtilityBills: {
    type: Number,
    optional: true,
  },
});

export default new SimpleSchema({
  visitorId: {
    type: String,
  },
  requestDate: {
    type: Date,
  },
  dataSource: {
    type: String,
    allowedValues: values(DataSource),
  },
  status: {
    type: String,
    allowedValues: values(ImdadRequestStatus),
  },
  notes: {
    type: String,
    optional: true,
  },
  approvedImdad: {
    type: ApprovedImdad,
    optional: true,
  },
  attachmentIds: {
    type: Array,
    optional: true,
  },
  'attachmentIds.$': {
    type: String,
  },
})
  .extend(identifiable)
  .extend(timestamps);
