import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';

// We want to ensure that the karkun belongs to a city that
// is contained in the portal.
export function isKarkunInPortal(karkunId, portalId) {
  const karkun = Karkuns.findOne(karkunId);
  const portal = Portals.findOne(portalId);

  const karkunCityId = karkun.cityId;
  const portalCities = portal.cityIds || [];

  if (portalCities.indexOf(karkunCityId) === -1) return false;
  return true;
}

export function isKarkunSubscribed(karkunId) {
  const karkun = Karkuns.findOne(karkunId);
  if (karkun.contactNumber1Subscribed || karkun.contactNumber2Subscribed) {
    return true;
  }

  return true;
}
