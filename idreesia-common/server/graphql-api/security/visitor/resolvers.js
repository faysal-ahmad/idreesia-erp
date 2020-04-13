import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { DataSource } from 'meteor/idreesia-common/constants';

import { processCsvData } from './helpers';

export default {
  Query: {
    pagedSecurityVisitors(obj, { filter }) {
      return Visitors.searchVisitors(filter);
    },

    securityVisitorById(obj, { _id }) {
      return Visitors.findOne(_id);
    },

    securityVisitorByCnic(obj, { cnicNumbers }) {
      if (cnicNumbers.length > 0) {
        return Visitors.findOne({
          cnicNumber: { $in: cnicNumbers },
        });
      }

      return null;
    },

    securityVisitorByCnicOrContactNumber(obj, { cnicNumber, contactNumber }) {
      return Visitors.findByCnicOrContactNumber(cnicNumber, contactNumber);
    },
  },

  Mutation: {
    createSecurityVisitor(obj, values, { user }) {
      return Visitors.createVisitor(
        {
          ...values,
          dataSource: DataSource.SECURITY,
        },
        user
      );
    },

    updateSecurityVisitor(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },

    deleteSecurityVisitor(obj, { _id }) {
      return Visitors.remove(_id);
    },

    setSecurityVisitorImage(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },

    updateSecurityVisitorNotes(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },

    importSecurityVisitorsCsvData(obj, { csvData }, { user }) {
      return processCsvData(csvData, new Date(), user);
    },
  },
};
