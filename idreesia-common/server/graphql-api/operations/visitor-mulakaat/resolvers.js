import moment from 'moment';
import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';

export default {
  Query: {
    pagedOperationsVisitorMulakaats(obj, { filter }) {
      return VisitorMulakaats.getPagedData(filter);
    },

    operationsVisitorMulakaatById(obj, { _id }) {
      return VisitorMulakaats.findOne(_id);
    },
  },

  Mutation: {
    createOperationsVisitorMulakaat(
      obj,
      { visitorId, mulakaatDate },
      { user }
    ) {
      if (!VisitorMulakaats.isMulakaatAllowed(visitorId, mulakaatDate)) {
        throw new Error(
          'Visitor already has done mulakaat in the last 7 days.'
        );
      }

      const mMulakaatDate = moment(mulakaatDate);
      const date = new Date();
      const visitorMulakaatId = VisitorMulakaats.insert({
        visitorId,
        mulakaatDate: mMulakaatDate.startOf('day').toDate(),
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return VisitorMulakaats.findOne(visitorMulakaatId);
    },

    cancelOperationsVisitorMulakaats(obj, { mulakaatDate }, { user }) {
      const date = new Date();
      const mMulakaatDate = moment(mulakaatDate);
      return VisitorMulakaats.update(
        {
          mulakaatDate: mMulakaatDate.startOf('day').toDate(),
        },
        {
          $set: {
            cancelledDate: date,
            cancelledBy: user._id,
            updatedAt: date,
            updatedBy: user._id,
          },
        },
        { multi: true }
      );
    },

    cancelOperationsVisitorMulakaat(obj, { _id }, { user }) {
      const date = new Date();
      VisitorMulakaats.update(_id, {
        $set: {
          cancelledDate: date,
          cancelledBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return VisitorMulakaats.findOne(_id);
    },

    deleteOperationsVisitorMulakaat(obj, { _id }) {
      return VisitorMulakaats.remove(_id);
    },
  },
};
