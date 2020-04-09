import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedTelephoneRoomVisitors(obj, { filter }) {
      return Visitors.searchVisitors(filter);
    },

    telephoneRoomVisitorById(obj, { _id }) {
      return Visitors.findOne(_id);
    },

    telephoneRoomVisitorsByCnic(obj, { cnicNumbers, partialCnicNumber }) {
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
    createTelephoneRoomVisitor(obj, values, { user }) {
      return Visitors.createVisitor(
        {
          ...values,
          dataSource: DataSource.TELEPHONE_ROOM,
        },
        user
      );
    },

    updateTelephoneRoomVisitor(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },

    deleteTelephoneRoomVisitor(obj, { _id }) {
      return Visitors.remove(_id);
    },

    setTelephoneRoomVisitorImage(obj, values, { user }) {
      return Visitors.updateVisitor(values, user);
    },
  },
};
