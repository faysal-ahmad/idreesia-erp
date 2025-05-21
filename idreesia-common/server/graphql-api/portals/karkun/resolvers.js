import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    portalKarkunById: async (obj, { portalId, _id }, { user }) => {
      const person = People.findOne(_id);
      // TODO: Check that the person is within the portal cities
      return People.personToKarkun(person);
    },

    pagedPortalKarkuns: async (obj, { portalId, filter }, { user }) => {
      const portal = Portals.findOne(portalId);
      const updatedFilter = {
        ...filter,
        cityIds: portal.cityIds,
      };

      return People.searchPeople(updatedFilter, {
        includeKarkuns: true,
      }).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },

    findPortalKarkunByCnicOrContactNumber: async (
      obj,
      { cnicNumber, contactNumber },
      { user }
    ) => {
      let person = null;

      if (cnicNumber) {
        person = People.findOne({
          'sharedData.cnicNumber': { $eq: cnicNumber },
        });
      }

      if (!person && contactNumber) {
        person = People.findOne({
          $or: [
            { 'sharedData.contactNumber1': contactNumber },
            { 'sharedData.contactNumber2': contactNumber },
          ],
        });
      }

      if (person) {
        return People.personToKarkun(person);
      }

      return null;
    },
  },

  Mutation: {
    createPortalKarkun: async (obj, values, { user }) => {
      const { portalId } = values;
      const personValues = People.karkunToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          isKarkun: true,
          isVisitor: true,
          dataSource: `${DataSource.PORTAL}-${portalId}`,
        },
        user
      );

      return People.personToKarkun(person);
    },

    updatePortalKarkun: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunWazaifAndRaabta: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunProfileImage: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    addPortalKarkun: async (obj, values, { user }) => {
      const { _id } = values;
      // We are converting a member into a karkun. We need to set
      // the karkun data like the cityId for it, so that it would
      // become visible in the portal karkuns.
      let person = People.findOne(_id);
      const cityName = person.visitorData?.city;
      const city = Cities.findOne({ name: cityName });

      People.update(_id, {
        $set: {
          isKarkun: true,
          isVisitor: false,
          karkunData: {
            cityId: city?._id,
          },
          updatedAt: new Date(),
          updatedBy: user._id,
        },
      });

      person = People.findOne(_id);
      return People.personToKarkun(person);
    },

    removePortalKarkun: async (obj, values, { user }) => {
      const { _id } = values;
      People.update(_id, {
        $set: {
          isKarkun: false,
          updatedAt: new Date(),
          updatedBy: user._id,
        },
      });

      return 1;
    },
  },
};
