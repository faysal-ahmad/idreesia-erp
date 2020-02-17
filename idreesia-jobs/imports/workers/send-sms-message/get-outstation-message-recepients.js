import { keys } from 'meteor/idreesia-common/utilities/lodash';
import { getOutstationKarkunsWithoutPagination } from 'meteor/idreesia-common/server/graphql-api/outstation/karkuns/queries';

export default function getOutstationMessageRecepients(message) {
  const { karkunFilter } = message;
  const filterKeys = keys(karkunFilter);
  if (filterKeys.length === 0) return Promise.resolve([]);
  return getOutstationKarkunsWithoutPagination(karkunFilter).then(karkuns => ({
    karkuns,
    visitors: [],
  }));
}
