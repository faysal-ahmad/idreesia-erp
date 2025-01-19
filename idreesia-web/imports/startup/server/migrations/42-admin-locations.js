import { Migrations } from 'meteor/percolate:migrations';

import { OrgLocationTypes } from 'meteor/idreesia-common/constants';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import {
  Cities,
  CityMehfils,
} from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 42,
  up() {
    // Create the root idreesia location
    const rootLocationId = OrgLocations.insert({
      name: 'Idreesia',
      type: OrgLocationTypes.ROOT,
      parentId: null,
      allParentIds: [],
    });

    const cities = Cities.find({}).fetch();
    cities.forEach(city => {
      // If the country location has not been created, then
      // create that first. Do same for zone.
      let countryLocation = OrgLocations.findOne({
        name: city.country,
        type: OrgLocationTypes.COUNTRY,
      });

      if (!countryLocation) {
        const countryLocationId = OrgLocations.insert({
          name: city.country,
          type: OrgLocationTypes.COUNTRY,
          parentId: rootLocationId,
          allParentIds: [rootLocationId],
        });
        countryLocation = OrgLocations.findOne(countryLocationId);
      }

      let cityLocation;

      if (city.region) {
        let zoneLocation = OrgLocations.findOne({
          name: `Zone ${city.region}`,
          type: OrgLocationTypes.GROUP,
        });
        if (!zoneLocation) {
          const zoneLocationId = OrgLocations.insert({
            name: `Zone ${city.region}`,
            type: OrgLocationTypes.GROUP,
            parentId: countryLocation._id,
            allParentIds: countryLocation.allParentIds.concat(
              countryLocation._id
            ),
          });
          zoneLocation = OrgLocations.findOne(zoneLocationId);
        }

        // Create the city under the zone location
        const cityLocationId = OrgLocations.insert({
          name: city.name,
          type: OrgLocationTypes.CITY,
          parentId: zoneLocation._id,
          allParentIds: zoneLocation.allParentIds.concat(zoneLocation._id),
        });
        cityLocation = OrgLocations.findOne(cityLocationId);
      } else {
        // Create the city under the country location
        const cityLocationId = OrgLocations.insert({
          name: city.name,
          type: OrgLocationTypes.CITY,
          parentId: countryLocation._id,
          allParentIds: countryLocation.allParentIds.concat(
            countryLocation._id
          ),
        });
        cityLocation = OrgLocations.findOne(cityLocationId);
      }

      // Get all the mehfils for this city
      const cityMehfils = CityMehfils.find({ cityId: city._id }).fetch();
      // Create location for each mehfil
      cityMehfils.forEach(cityMehfil => {
        // Create the city under the zone location
        const mehfilLocationId = OrgLocations.insert({
          name: cityMehfil.name,
          type: OrgLocationTypes.MEHFIL,
          parentId: cityLocation._id,
          allParentIds: cityLocation.allParentIds.concat(cityLocation._id),
          mehfilDetails: {
            address: cityMehfil.address,
            mehfilStartYear: cityMehfil.mehfilStartYear,
            timingDetails: cityMehfil.timingDetails,
            lcdAvailability: cityMehfil.lcdAvailability,
            tabAvailability: cityMehfil.tabAvailability,
            otherMehfilDetails: cityMehfil.otherMehfilDetails,
          },
        });

        // Save the id of this location back into the citymehfil
        // for later use
        CityMehfils.update(
          {
            _id: cityMehfil._id,
          },
          {
            $set: {
              orgLocationId: mehfilLocationId,
            },
          }
        );
      });
    });
  },
});
