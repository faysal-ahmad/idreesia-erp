import { keys } from 'meteor/idreesia-common/utilities/lodash';
import { getKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/hr/karkuns/queries';

export default function getHrMessageRecepients(message) {
  const { karkunFilter } = message;
  const filterKeys = keys(karkunFilter);
  if (filterKeys.length === 0) return Promise.resolve([]);
  return getKarkunsWithoutPagination(karkunFilter).then(karkuns => ({
    karkuns,
    visitors: [],
  }));
}
