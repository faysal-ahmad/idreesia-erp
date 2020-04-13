import moment from 'moment';
import { VisitorMulakaats } from 'meteor/idreesia-common/server/collections/security';

export default {
  Query: {
    pagedTelephoneRoomVisitorMulakaats(obj, { filter }) {
      return VisitorMulakaats.getPagedData(filter);
    },

    telephoneRoomVisitorMulakaatById(obj, { _id }) {
      return VisitorMulakaats.findOne(_id);
    },
  },

  Mutation: {
    createTelephoneRoomVisitorMulakaat(
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

    cancelTelephoneRoomVisitorMulakaats(obj, { mulakaatDate }, { user }) {
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

    cancelTelephoneRoomVisitorMulakaat(obj, { _id }, { user }) {
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

    deleteTelephoneRoomVisitorMulakaat(obj, { _id }) {
      return VisitorMulakaats.remove(_id);
    },
  },
};
