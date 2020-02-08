import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPortalKarkuns, getPortalKarkunsByVisitor } from './queries';

export default {
  Query: {
    portalKarkunById(obj, { portalId, _id }, { user }) {
      if (hasInstanceAccess(user._id, portalId) === false) return null;
      return Karkuns.findOne(_id);
    },

    pagedPortalKarkuns(obj, { portalId, queryString }, { user }) {
      if (hasInstanceAccess(user._id, portalId) === false) {
        return {
          karkuns: [],
          totalResults: 0,
        };
      }

      return getPortalKarkuns(portalId, queryString);
    },

    portalKarkunsByVisitor(
      obj,
      { portalId, visitorName, visitorCnic, visitorPhone },
      { user }
    ) {
      if (hasInstanceAccess(user._id, portalId) === false) {
        return {
          karkuns: [],
          totalResults: 0,
        };
      }

      return getPortalKarkunsByVisitor(
        portalId,
        visitorName,
        visitorCnic,
        visitorPhone
      );
    },
  },

  Mutation: {
    createPortalKarkun(
      obj,
      {
        portalId,
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        currentAddress,
        permanentAddress,
        cityId,
        cityMehfilId,
        bloodGroup,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        referenceName,
        imageId,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTAL_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      if (cnicNumber) {
        const existingKarkun = Karkuns.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
        if (existingKarkun) {
          throw new Error(
            `This CNIC number is already set for ${existingKarkun.name}.`
          );
        }
      }

      const date = new Date();
      let updateImageId = null;
      // If an imageId is passed when creating a karkun, then clone that image
      // and use the id of the newly cloned image as imageId for this karkun
      if (imageId) {
        const image = Attachments.findOne(imageId);
        updateImageId = Attachments.insert({
          name: image.name,
          description: image.description,
          mimeType: image.mimeType,
          data: image.data,
          createdAt: date,
          createdBy: user._id,
          updatedAt: date,
          updatedBy: user._id,
        });
      }

      const karkunId = Karkuns.insert({
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        currentAddress,
        permanentAddress,
        cityId,
        cityMehfilId,
        bloodGroup,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        referenceName,
        imageId: updateImageId,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Karkuns.findOne(karkunId);
    },

    updatePortalKarkun(
      obj,
      {
        portalId,
        _id,
        name,
        parentName,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        currentAddress,
        permanentAddress,
        cityId,
        cityMehfilId,
        bloodGroup,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        referenceName,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTAL_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      if (cnicNumber) {
        const existingKarkun = Karkuns.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
        if (existingKarkun && existingKarkun._id !== _id) {
          throw new Error(
            `This CNIC number is already set for ${existingKarkun.name}.`
          );
        }
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          name,
          parentName,
          cnicNumber,
          contactNumber1,
          contactNumber2,
          emailAddress,
          currentAddress,
          permanentAddress,
          cityId,
          cityMehfilId,
          bloodGroup,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          referenceName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    setPortalKarkunProfileImage(obj, { portalId, _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.PORTAL_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      // If the user already has another image attached, then remove that attachment
      // since it will now become orphaned.
      const existingKarkun = Karkuns.findOne(_id);
      if (existingKarkun.imageId) {
        Attachments.remove(existingKarkun.imageId);
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          imageId,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },
  },
};
