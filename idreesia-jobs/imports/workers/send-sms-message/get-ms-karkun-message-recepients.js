import { keys } from 'meteor/idreesia-common/utilities/lodash';
import { getKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/hr/karkun/queries';

export default function getMsKarkunMessageRecepients(recepientFilter) {
  const filterKeys = keys(recepientFilter);
  if (filterKeys.length === 0) return Promise.resolve([]);
  return getKarkunsWithoutPagination(recepientFilter).then(karkuns => ({
    karkuns,
    visitors: [],
  }));
}
