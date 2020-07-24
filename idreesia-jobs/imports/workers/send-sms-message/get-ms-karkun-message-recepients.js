import { getKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/hr/karkun/queries';

export default function getMsKarkunMessageRecepients(recepientFilter) {
  return getKarkunsWithoutPagination(recepientFilter).then(karkuns => ({
    karkuns,
    visitors: [],
  }));
}
