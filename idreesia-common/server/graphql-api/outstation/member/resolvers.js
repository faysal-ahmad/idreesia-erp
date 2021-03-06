import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    pagedOutstationMembers(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_MEMBERS,
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return Visitors.searchVisitors(filter);
    },

    outstationMemberById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_VIEW_MEMBERS,
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },
  },

  Mutation: {
    importOutstationMember(
      obj,
      {
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        cityId,
        ehadDate,
        birthDate,
        referenceName,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      // Check if we already have an existing visitor coresponding to these values
      // Create a new visitor corresponding to this member if one is not found
      const existingVisitor = Visitors.findByCnicOrContactNumber(
        cnicNumber,
        contactNumber1
      );

      if (!existingVisitor) {
        const city = Cities.findOne(cityId);
        Visitors.createVisitor(
          {
            name,
            parentName,
            cnicNumber,
            contactNumber1,
            city: city.name,
            country: city.country,
            ehadDate,
            birthDate,
            referenceName,
            dataSource: DataSource.OUTSTATION,
          },
          user
        );

        return 'New member created.';
      }

      return 'Member already exists. Ignored.';
    },

    createOutstationMember(obj, values, { user }) {
      if (
        user &&
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      return Visitors.createVisitor(
        {
          ...values,
          dataSource: DataSource.OUTSTATION,
        },
        user
      );
    },

    updateOutstationMember(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
    },

    deleteOutstationMember(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_DELETE_DATA,
        ])
      ) {
        throw new Error(
          'You do not have permission to delete Members in the System.'
        );
      }

      return Visitors.remove(_id);
    },

    setOutstationMemberImage(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      return Visitors.updateVisitor(values, user);
    },
  },
};
