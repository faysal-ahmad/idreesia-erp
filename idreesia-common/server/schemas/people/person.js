import SimpleSchema from 'simpl-schema';

import { identifiable, timestamps } from '../common';
import { default as Employee } from './employee';
import { default as Karkun } from './karkun';
import { default as Visitor } from './visitor';
import { default as Shared } from './shared';

export default new SimpleSchema({
  isEmployee: {
    type: Boolean,
    optional: false,
  },
  isKarkun: {
    type: Boolean,
    optional: false,
  },
  isVisitor: {
    type: Boolean,
    optional: false,
  },
  userId: {
    type: String,
    optional: true,
  },
  sharedData: {
    type: Shared,
    optional: false,
  },
  employeeData: {
    type: Employee,
    optional: true,
  },
  karkunData: {
    type: Karkun,
    optional: true,
  },
  visitorData: {
    type: Visitor,
    optional: true,
  },
  dataSource: {
    type: String,
    optional: true,
  },
})
  .extend(identifiable)
  .extend(timestamps);
