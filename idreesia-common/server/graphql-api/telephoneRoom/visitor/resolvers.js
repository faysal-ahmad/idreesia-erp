import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { createAttachment } from 'meteor/idreesia-common/server/graphql-api/common/attachment/utilities';

export default {
  Query: {
    pagedTelephoneRoomVisitors(obj, { filter }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return Visitors.searchVisitors(filter);
    },

    telephoneRoomVisitorById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },

    telephoneRoomVisitorsByCnic(
      obj,
      { cnicNumbers, partialCnicNumber },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.TR_VIEW_VISITORS,
          PermissionConstants.TR_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      if (cnicNumbers.length > 0) {
        return Visitors.find({
          cnicNumber: { $in: cnicNumbers },
        }).fetch();
      }

      if (partialCnicNumber) {
        return Visitors.find({
          cnicNumber: { $regex: new RegExp(`-${partialCnicNumber}-`, 'i') },
        }).fetch();
      }

      return null;
    },
  },

  Mutation: {
    createTelephoneRoomVisitor(
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
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
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
        dataSource: 'telephone-room',
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Visitors.findOne(visitorId);
    },

    updateTelephoneRoomVisitor(
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
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
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

    deleteTelephoneRoomVisitor(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.TR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Visitors in the System.'
        );
      }

      return Visitors.remove(_id);
    },

    setTelephoneRoomVisitorImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.TR_MANAGE_VISITORS])
      ) {
        throw new Error(
          'You do not have permission to manage Visitors in the System.'
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
