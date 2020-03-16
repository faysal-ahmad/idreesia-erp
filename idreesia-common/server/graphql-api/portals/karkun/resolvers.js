import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';

import { getPortalKarkuns } from './queries';

export default {
  Query: {
    portalKarkunById(obj, { portalId, _id }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
      ) {
        return null;
      }

      return Karkuns.findOne(_id);
    },

    pagedPortalKarkuns(obj, { portalId, filter }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
      ) {
        return {
          karkuns: [],
          totalResults: 0,
        };
      }

      return getPortalKarkuns(portalId, filter);
    },

    findPortalKarkunByCnicOrContactNumber(
      obj,
      { portalId, cnicNumber, contactNumber },
      { user }
    ) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_KARKUNS,
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
      ) {
        return null;
      }

      let karkun = null;

      if (cnicNumber) {
        karkun = Karkuns.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
      }

      if (karkun) return karkun;

      if (contactNumber) {
        karkun = Karkuns.findOne({
          $or: [
            { contactNumber1: contactNumber },
            { contactNumber2: contactNumber },
          ],
        });
      }

      return karkun;
    },
  },

  Mutation: {
    createPortalKarkun(obj, { portalId, memberId, cityId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
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

      const member = Visitors.findOne(memberId);

      if (member.cnicNumber) {
        const existingKarkun = Karkuns.findOne({
          cnicNumber: { $eq: member.cnicNumber },
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
      if (member.imageId) {
        const image = Attachments.findOne(member.imageId);
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

      const karkun = Karkuns.createKarkun(
        {
          name: member.name,
          parentName: member.parentName,
          cnicNumber: member.cnicNumber,
          contactNumber1: member.contactNumber1,
          contactNumber2: member.contactNumber2,
          cityId,
          ehadDate: member.ehadDate,
          birthDate: member.birthDate,
          referenceName: member.referenceName,
          imageId: updateImageId,
        },
        user
      );

      Visitors.update(memberId, {
        $set: {
          karkunId: karkun._id,
        },
      });

      return karkun;
    },

    linkPortalKarkun(obj, { portalId, memberId, karkunId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
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

      // Before linking this karkun to the member, make sure that this karkun
      // is not already linked to another member.
      const karkunMember = Visitors.findOne({ karkunId });
      if (karkunMember) {
        throw new Error(
          'This Karkun is already linked to another Member in the system.'
        );
      }

      Visitors.update(memberId, {
        $set: {
          karkunId,
        },
      });

      return Karkuns.findOne(karkunId);
    },

    updatePortalKarkun(obj, values, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const { portalId } = values;
      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Karkuns in this Mehfil Portal.'
        );
      }

      return Karkuns.updateKarkun(values, user);
    },

    setPortalKarkunWazaifAndRaabta(
      obj,
      { portalId, _id, lastTarteebDate, mehfilRaabta, msRaabta },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
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

      return Karkuns.updateKarkun(
        { _id, lastTarteebDate, mehfilRaabta, msRaabta },
        user
      );
    },

    setPortalKarkunProfileImage(obj, { portalId, _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_KARKUNS,
        ])
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

      return Karkuns.updateKarkun({ _id, imageId }, user);
    },
  },
};
