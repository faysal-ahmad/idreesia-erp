import { Migrations } from 'meteor/quave:migrations';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  OrgLocations,
  type OrgLocationDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

type NewLocation = Pick<OrgLocationDocument, 'name' | 'type' | 'mehfilDetails'>;

// Seeds the org-locations tree (root > country > [zone] > city > mehfil) from
// the existing cities and city mehfils. Skipped when a root already exists.
Migrations.add({
  version: 69,
  async up() {
    const collection = OrgLocations.rawCollection();
    await collection.createIndex({ parentId: 1 }, { background: true });
    await collection.createIndex({ allParentIds: 1 }, { background: true });

    const peopleCollection = People.rawCollection();
    await peopleCollection.createIndex(
      { 'karkunData.cityLocationId': 1 },
      { background: true }
    );
    await peopleCollection.createIndex(
      { 'karkunData.mehfilLocationId': 1 },
      { background: true }
    );

    const existingRoot = await OrgLocations.findOneAsync({
      type: OrgLocationTypes.ROOT,
    });
    if (existingRoot) return;

    const date = new Date();
    const insert = async (
      location: NewLocation,
      parent: OrgLocationDocument | null
    ): Promise<OrgLocationDocument> => {
      const _id = await OrgLocations.insertAsync({
        ...location,
        parentId: parent?._id ?? null,
        allParentIds: parent
          ? [...(parent.allParentIds ?? []), parent._id as string]
          : [],
        createdAt: date,
        updatedAt: date,
      });
      return (await OrgLocations.findOneAsync({ _id })) as OrgLocationDocument;
    };

    const root = await insert(
      { name: 'Idreesia', type: OrgLocationTypes.ROOT },
      null
    );

    const countries = new Map<string, OrgLocationDocument>();
    const zones = new Map<string, OrgLocationDocument>();

    const cities = await Cities.find({}, { sort: { name: 1 } }).fetchAsync();
    for (const city of cities) {
      const countryName = city.country as string;
      let country = countries.get(countryName);
      if (!country) {
        country = await insert(
          { name: countryName, type: OrgLocationTypes.COUNTRY },
          root
        );
        countries.set(countryName, country);
      }

      let parent = country;
      if (city.region) {
        const zoneKey = `${countryName}|${city.region}`;
        let zone = zones.get(zoneKey);
        if (!zone) {
          zone = await insert(
            { name: `Zone ${city.region}`, type: OrgLocationTypes.GROUP },
            country
          );
          zones.set(zoneKey, zone);
        }
        parent = zone;
      }

      const cityLocation = await insert(
        { name: city.name as string, type: OrgLocationTypes.CITY },
        parent
      );
      // Point karkuns of this city at the new city location.
      await peopleCollection.updateMany(
        { 'karkunData.cityId': city._id },
        { $set: { 'karkunData.cityLocationId': cityLocation._id } }
      );

      const mehfils = await CityMehfils.find(
        { cityId: city._id },
        { sort: { name: 1 } }
      ).fetchAsync();
      for (const mehfil of mehfils) {
        const {
          address,
          mehfilStartYear,
          timingDetails,
          lcdAvailability,
          tabAvailability,
          otherMehfilDetails,
        } = mehfil;
        const mehfilDetails = Object.fromEntries(
          Object.entries({
            address,
            mehfilStartYear,
            timingDetails,
            lcdAvailability,
            tabAvailability,
            otherMehfilDetails,
          }).filter(([, value]) => value !== undefined && value !== null)
        );
        const mehfilLocation = await insert(
          {
            name: mehfil.name as string,
            type: OrgLocationTypes.MEHFIL,
            mehfilDetails,
          },
          cityLocation
        );
        // Point karkuns of this mehfil at the new mehfil location.
        await peopleCollection.updateMany(
          { 'karkunData.cityMehfilId': mehfil._id },
          { $set: { 'karkunData.mehfilLocationId': mehfilLocation._id } }
        );
      }
    }
  },
});
