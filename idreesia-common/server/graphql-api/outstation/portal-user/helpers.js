import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

// We want to ensure that the karkun belongs to a city that
// is contained in the portal.
export function isKarkunInPortal(karkunId, portalId) {
  const person = People.findOne(karkunId);
  const portal = Portals.findOne(portalId);

  const karkunCityId = person.karkunData?.cityId;
  const portalCities = portal.cityIds || [];

  if (portalCities.indexOf(karkunCityId) === -1) return false;
  return true;
}

export function isKarkunSubscribed(karkunId) {
  const person = People.findOne(karkunId);
  return (
    person.sharedData.contactNumber1Subscribed ||
    person.sharedData.contactNumber2Subscribed
  );
}
