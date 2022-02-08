import { People } from 'meteor/idreesia-common/server/collections/common';
import { Portals } from 'meteor/idreesia-common/server/collections/portals';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  DataSource,
  Permissions as PermissionConstants,
} from 'meteor/idreesia-common/constants';

const userHasPortalLevelAccess = user =>
  hasOnePermission(user, [
    PermissionConstants.PORTALS_VIEW_KARKUNS,
    PermissionConstants.PORTALS_MANAGE_KARKUNS,
  ]);

export default {
  Query: {
    portalKarkunById(obj, { _id }, { user }) {
      const person = People.findOne(_id);
      if (!userHasPortalLevelAccess(user)) {
        const userPerson = People.findOne(user.personId);
        const cityMehfilId = userPerson?.karkunData?.cityMehfilId;
        if (
          !cityMehfilId ||
          person?.karkunData?.cityMehfilId !== cityMehfilId
        ) {
          return null;
        }
      }

      return People.personToKarkun(person);
    },

    pagedPortalKarkuns(obj, { portalId, filter }, { user }) {
      const portal = Portals.findOne(portalId);
      const updatedFilter = {
        ...filter,
        cityIds: portal.cityIds,
      };

      // Check whether the user is allowed to see all karkuns for
      // the portal, or just for the mehfil that he belongs to.
      if (!userHasPortalLevelAccess(user)) {
        // Add filter for the mehfil to the incoming filters
        const person = People.findOne(user.personId);
        const cityMehfilId = person?.karkunData?.cityMehfilId;
        if (!cityMehfilId) {
          return {
            karkuns: [],
            totalResults: 0,
          };
        }

        updatedFilter.cityMehfilId = cityMehfilId;
      }

      return People.searchPeople(updatedFilter, {
        includeKarkuns: true,
      }).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },

    findPortalKarkunByCnicOrContactNumber(
      obj,
      { cnicNumber, contactNumber },
      { user }
    ) {
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
        if (!userHasPortalLevelAccess(user)) {
          const userPerson = People.findOne(user.personId);
          if (
            !userPerson?.karkunData?.cityMehfilId ||
            userPerson?.karkunData?.cityMehfilId !==
              person?.karkunData?.cityMehfilId
          ) {
            return null;
          }
        }

        return People.personToKarkun(person);
      }

      return null;
    },
  },

  Mutation: {
    createPortalKarkun(obj, values, { user }) {
      const { portalId, cityMehfilId } = values;
      if (!userHasPortalLevelAccess(user)) {
        const userPerson = People.findOne(user.personId);
        if (
          !userPerson?.karkunData?.cityMehfilId ||
          userPerson?.karkunData?.cityMehfilId !== cityMehfilId
        ) {
          return null;
        }
      }

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

    updatePortalKarkun(obj, values, { user }) {
      const { _id, cityMehfilId } = values;
      let person = People.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const userPerson = People.findOne(user.personId);
        if (
          !userPerson?.karkunData?.cityMehfilId ||
          userPerson?.karkunData?.cityMehfilId !==
            person?.karkunData?.cityMehfilId ||
          userPerson?.karkunData?.cityMehfilId !== cityMehfilId
        ) {
          return People.personToKarkun(person);
        }
      }

      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunWazaifAndRaabta(obj, values, { user }) {
      const { _id } = values;
      let person = People.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const userPerson = People.findOne(user.personId);
        if (
          !userPerson?.karkunData?.cityMehfilId ||
          userPerson?.karkunData?.cityMehfilId !==
            person?.karkunData?.cityMehfilId
        ) {
          return People.personToKarkun(person);
        }
      }

      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setPortalKarkunProfileImage(obj, values, { user }) {
      const { _id } = values;
      let person = People.findOne({ _id });
      if (!userHasPortalLevelAccess(user)) {
        const userPerson = People.findOne(user.personId);
        if (
          !userPerson?.karkunData?.cityMehfilId ||
          userPerson?.karkunData?.cityMehfilId !==
            person?.karkunData?.cityMehfilId
        ) {
          return People.personToKarkun(person);
        }
      }

      const personValues = People.karkunToPerson(values);
      person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    addPortalKarkun(obj, values, { user }) {
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

    removePortalKarkun(obj, values, { user }) {
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
