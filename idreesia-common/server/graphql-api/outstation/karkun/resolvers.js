import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getOutstationKarkuns } from './queries';

export default {
  Query: {
    outstationKarkunById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        return null;
      }

      return Karkuns.findOne(_id);
    },

    pagedOutstationKarkuns(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_KARKUNS,
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        return {
          karkuns: [],
          totalResults: 0,
        };
      }

      return getOutstationKarkuns(filter);
    },
  },

  Mutation: {
    importOutstationKarkun(
      obj,
      {
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        cityId,
        cityMehfilId,
        ehadDate,
        birthDate,
        referenceName,
        lastTarteebDate,
        mehfilRaabta,
        msRaabta,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      // Do we have an existing karkun corresponding to the passed values
      // Use cnic and contact number to lookup existing karkun.
      const existingKarkun = Karkuns.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber1
      );

      if (!existingKarkun) {
        // Create a karkun from using the passed values
        const newKarkun = Karkuns.createKarkun(
          {
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            cityId,
            cityMehfilId,
            ehadDate,
            birthDate,
            referenceName,
            lastTarteebDate,
            mehfilRaabta,
            msRaabta,
          },
          user
        );

        // Check if we already have an existing visitor coresponding to these values
        // Create a new visitor corresponding to this karkun if one is not found
        const existingVisitor = Visitors.findByCnicOrContactNumber(
          cnicNumber,
          contactNumber1
        );

        if (!existingVisitor) {
          const city = Cities.findOne(cityId);
          Visitors.createVisitor({
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            city: city.name,
            country: city.country,
            ehadDate,
            birthDate,
            referenceName,
            karkunId: newKarkun._id,
            dataSource: DataSource.OUTSTATION,
          });
        }

        return 'New karkun created.';
      }

      return 'Karkun already exists. Ignored.';
    },

    updateOutstationKarkun(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    deleteOutstationKarkun(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to delete Outstation Karkuns in the System.'
        );
      }

      if (canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setOutstationKarkunWazaifAndRaabta(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    setOutstationKarkunEhadDuty(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    setOutstationKarkunProfileImage(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Outstation Karkuns in the System.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },
  },
};
