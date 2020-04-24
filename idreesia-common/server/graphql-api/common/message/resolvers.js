import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { getKarkunsByFilter as getMSKarkuns } from 'meteor/idreesia-common/server/graphql-api/hr/karkun/queries';
import { getOutstationKarkuns } from 'meteor/idreesia-common/server/graphql-api/outstation/karkun/queries';

export default {
  MessageType: {
    msKarkunCount: messageType =>
      messageType.msKarkunIds ? messageType.msKarkunIds.length : 0,
    outstationKarkunCount: messageType =>
      messageType.outstationKarkunIds
        ? messageType.outstationKarkunIds.length
        : 0,
    visitorCount: messageType =>
      messageType.visitorIds ? messageType.visitorIds.length : 0,
  },

  Query: {
    pagedMSKarkunMessageRecepients(obj, { recepientFilter }) {
      return getMSKarkuns(recepientFilter);
    },

    pagedOutstationKarkunMessageRecepients(obj, { recepientFilter }) {
      return getOutstationKarkuns(recepientFilter);
    },

    pagedVisitorMessageRecepients(obj, { recepientFilter }) {
      return Visitors.searchVisitors(recepientFilter);
    },
  },
};
