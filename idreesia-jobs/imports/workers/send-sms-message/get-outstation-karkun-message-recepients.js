import { keys } from 'meteor/idreesia-common/utilities/lodash';
import { getOutstationKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/outstation/karkun/queries';

export default function getOutstationMessageRecepients(recepientFilter) {
  const filterKeys = keys(recepientFilter);
  if (filterKeys.length === 0) return Promise.resolve([]);
  return getOutstationKarkunsWithoutPagination(recepientFilter).then(
    karkuns => ({
      karkuns,
      visitors: [],
    })
  );
}
