import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOperationsVisitors(obj, { filter }) {
      return Visitors.searchVisitors(filter);
    },

    operationsVisitorById(obj, { _id }) {
      return Visitors.findOne(_id);
    },

    operationsVisitorsByCnic(obj, { cnicNumbers, partialCnicNumber }) {
      if (cnicNumbers.length > 0) {
        return Visitors.find({
          cnicNumber: { $in: cnicNumbers },
        }).fetch();
      }

      if (partialCnicNumber) {
        return Visitors.find({
          cnicNumber: { $regex: new RegExp(`-${partialCnicNumber}-`, 'i') },
        }).fetch();
      }

      return null;
    },
  },

  Mutation: {
    createOperationsVisitor(obj, values, { user }) {
      return Visitors.createVisitor(
        {
          ...values,
          dataSource: DataSource.OPERATIONS,
        },
        user
      );
    },

    updateOperationsVisitor(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },

    deleteOperationsVisitor(obj, { _id }) {
      return Visitors.remove(_id);
    },

    setOperationsVisitorImage(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },
  },
};
