import { Migrations } from 'meteor/percolate:migrations';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 37,
  up() {
    // Create portals for all cities which are not periphery
    // of another city.
    const cities = Cities.find({}).fetch();
    cities.forEach(city => {
      if (!city.peripheryOf) {
        // Find out if there is already a portal with the city name
        const portal = Portals.findOne({ name: city.name });
        if (!portal) {
          // Get all periphery cities of this city
          const peripheryCities = Cities.find({
            peripheryOf: city._id,
          }).fetch();
          // Create a portal for this city
          const cityIds = [city._id].concat(peripheryCities.map(pc => pc._id));
          Portals.insert({
            name: city.name,
            cityIds,
          });
        }
      }
    });
  },
});
