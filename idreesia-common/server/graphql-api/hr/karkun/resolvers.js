import { Karkuns } from 'meteor/idreesia-common/server/collections/hr';
import { Attachments } from 'meteor/idreesia-common/server/collections/common';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';

import { getKarkuns } from './queries';

export default {
  Query: {
    hrKarkunById(obj, { _id }) {
      return Karkuns.findOne(_id);
    },

    pagedHrKarkuns(obj, { filter }) {
      return getKarkuns(filter);
    },
  },

  Mutation: {
    createHrKarkun(
      obj,
      {
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
        sharedResidenceId,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        birthDate,
        lastTarteebDate,
        referenceName,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
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
        sharedResidenceId,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        birthDate,
        lastTarteebDate,
        referenceName,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Karkuns.findOne(karkunId);
    },

    updateHrKarkun(
      obj,
      {
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
        sharedResidenceId,
        educationalQualification,
        meansOfEarning,
        ehadDate,
        birthDate,
        lastTarteebDate,
        referenceName,
      },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.HR_MANAGE_KARKUNS,
          PermissionConstants.HR_MANAGE_EMPLOYEES,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
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
          sharedResidenceId,
          educationalQualification,
          meansOfEarning,
          ehadDate,
          birthDate,
          lastTarteebDate,
          referenceName,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    deleteHrKarkun(obj, { _id }, { user }) {
      if (!hasOnePermission(user._id, [PermissionConstants.HR_DELETE_DATA])) {
        throw new Error(
          'You do not have permission to delete Karkuns in the System.'
        );
      }

      if (canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setHrKarkunEmploymentInfo(
      obj,
      { _id, isEmployee, jobId, employmentStartDate, employmentEndDate },
      { user }
    ) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_EMPLOYEES])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $set: {
          isEmployee,
          jobId,
          employmentStartDate,
          employmentEndDate,
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    setHrKarkunProfileImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
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

    addHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $addToSet: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      return Karkuns.findOne(_id);
    },

    removeHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      if (
        !hasOnePermission(user._id, [PermissionConstants.HR_MANAGE_KARKUNS])
      ) {
        throw new Error(
          'You do not have permission to manage Karkuns in the System.'
        );
      }

      const date = new Date();
      Karkuns.update(_id, {
        $pull: {
          attachmentIds: attachmentId,
        },
        $set: {
          updatedAt: date,
          updatedBy: user._id,
        },
      });

      Attachments.remove(attachmentId);
      return Karkuns.findOne(_id);
    },
  },
};
