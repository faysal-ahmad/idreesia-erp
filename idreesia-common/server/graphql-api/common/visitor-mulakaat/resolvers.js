import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export default {
  VisitorMulakaatType: {
    visitor: visitorMulakaat =>
      Visitors.findOne({
        _id: { $eq: visitorMulakaat.visitorId },
      }),
  },
};
