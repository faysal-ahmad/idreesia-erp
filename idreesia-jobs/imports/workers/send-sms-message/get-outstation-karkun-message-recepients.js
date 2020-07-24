import { getOutstationKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/outstation/karkun/queries';

export default function getOutstationMessageRecepients(recepientFilter) {
  return getOutstationKarkunsWithoutPagination(recepientFilter).then(
    karkuns => ({
      karkuns,
      visitors: [],
    })
  );
}
