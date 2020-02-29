import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { createAttachment } from 'meteor/idreesia-common/server/graphql-api/common/attachment/utilities';

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
          PermissionConstants.PORTALS_VIEW_MEMBERS,
          PermissionConstants.PORTALS_MANAGE_MEMBERS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },
  },

  Mutation: {
    createOutstationMember(
      obj,
      {
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        imageData,
      },
      { user }
    ) {
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

      if (cnicNumber) Visitors.checkCnicNotInUse(cnicNumber);
      if (contactNumber1) Visitors.checkContactNotInUse(contactNumber1);
      if (contactNumber2) Visitors.checkContactNotInUse(contactNumber2);

      let imageId = null;
      if (imageData) {
        imageId = createAttachment(
          {
            data: imageData,
          },
          { user }
        );
      }

      const date = new Date();
      const visitorId = Visitors.insert({
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        imageId,
        dataSource: 'outstation',
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Visitors.findOne(visitorId);
    },

    updateOutstationMember(
      obj,
      {
        _id,
        name,
        parentName,
        cnicNumber,
        ehadDate,
        birthDate,
        referenceName,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
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

      if (cnicNumber) Visitors.checkCnicNotInUse(cnicNumber, _id);
      if (contactNumber1) Visitors.checkContactNotInUse(contactNumber1, _id);
      if (contactNumber2) Visitors.checkContactNotInUse(contactNumber2, _id);

      const date = new Date();
      Visitors.update(_id, {
        $set: {
          name,
          parentName,
          cnicNumber,
          ehadDate,
          birthDate,
          referenceName,
          contactNumber1,
          contactNumber2,
          emailAddress,
          address,
          city,
          country,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
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

    setOutstationMemberImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.OUTSTATION_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      const date = new Date();
      Visitors.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Visitors.findOne(_id);
    },
  },
};
