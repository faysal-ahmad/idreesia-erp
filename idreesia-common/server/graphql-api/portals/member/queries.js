import { parse } from 'query-string';
import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

export function getPortalMembers(portalId, queryString) {
  const portal = Portals.findOne(portalId);
  const cities = Cities.find({ _id: { $in: portal.cityIds } });
  const cityNames = cities.map(city => city.name);

  const params = parse(queryString);
  return People.searchPeople({
    ...params,
    cityNames,
  });
}
