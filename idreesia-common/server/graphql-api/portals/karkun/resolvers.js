import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    portalKarkunById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToKarkun(person);
    },

    pagedPortalKarkuns(obj, { portalId, filter }) {
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

    findPortalKarkunByCnicOrContactNumber(obj, { cnicNumber, contactNumber }) {
      let person = null;

      if (cnicNumber) {
        person = People.findOne({
          'sharedData.cnicNumber': { $eq: cnicNumber },
        });
      }

      if (person) return People.personToKarkun(person);

      if (contactNumber) {
        person = People.findOne({
          $or: [
            { 'sharedData.contactNumber1': contactNumber },
            { 'sharedData.contactNumber2': contactNumber },
          ],
        });
      }

      if (person) return People.personToKarkun(person);
      return null;
    },
  },

  Mutation: {
    createPortalKarkun(obj, values, { user }) {
      const { portalId } = values;
      const personValues = People.visitorToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          dataSource: `${DataSource.PORTAL}-${portalId}`,
        },
        user
      );

      return People.personToKarkun(person);
    },

    updatePortalKarkun(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunWazaifAndRaabta(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunProfileImage(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },
  },
};
