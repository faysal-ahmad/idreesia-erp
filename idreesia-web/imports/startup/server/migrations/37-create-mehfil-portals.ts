import { Migrations } from 'meteor/quave:migrations';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';

Migrations.add({
  version: 37,
  async up() {
    // Create portals for all cities which are not periphery
    // of another city.
    const cities = await Cities.find({}).fetchAsync();
    for (const city of cities) {
      if (!city.peripheryOf) {
        // Find out if there is already a portal with the city name
        const portal = await Portals.findOneAsync({ name: city.name });
        if (!portal) {
          // Get all periphery cities of this city
          const peripheryCities = await Cities.find({
            peripheryOf: city._id,
          }).fetchAsync();
          // Create a portal for this city
          const cityIds = [city._id].concat(peripheryCities.map((pc: { _id?: string }) => pc._id).filter(Boolean));
          await Portals.insertAsync({
            name: city.name,
            cityIds,
          });
        }
      }
    }
  },
});
