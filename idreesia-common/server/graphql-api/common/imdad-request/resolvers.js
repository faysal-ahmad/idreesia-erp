import { Visitors } from 'meteor/idreesia-common/server/collections/security';

export default {
  ImdadRequestType: {
    visitor: imdadRequestType => Visitors.findOne(imdadRequestType.visitorId),
  },
};
