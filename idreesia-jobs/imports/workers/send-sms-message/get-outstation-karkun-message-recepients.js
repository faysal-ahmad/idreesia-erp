import { People } from 'meteor/idreesia-common/server/collections/common';

export default function getOutstationMessageRecepients(recepientFilter) {
  return People.searchPeople(recepientFilter, {
    includeKarkuns: true,
    includeEmployees: true,
    paginatedResults: false,
  }).then(people => ({
    karkuns: people.map(person => People.personToKarkun(person)),
    visitors: [],
  }));
}
