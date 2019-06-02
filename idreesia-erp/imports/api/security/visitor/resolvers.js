import { Visitors } from "meteor/idreesia-common/collections/security";
import { hasOnePermission } from "/imports/api/security";
import { Permissions as PermissionConstants } from "meteor/idreesia-common/constants";

import { getVisitors } from "./queries";

export default {
  VisitorType: {
    name: visitorType =>
      `${visitorType.firstName} ${visitorType.lastName || ""}`,
  },

  Query: {
    pagedVisitors(obj, { queryString }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return [];
      }

      return getVisitors(queryString);
    },

    visitorById(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne(_id);
    },

    visitorByCnic(obj, { cnic }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_VIEW_VISITORS,
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        return null;
      }

      return Visitors.findOne({
        cnicNumber: { $eq: cnic },
      });
    },
  },

  Mutation: {
    createVisitor(
      obj,
      {
        firstName,
        lastName,
        cnicNumber,
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
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
        );
      }

      if (cnicNumber) {
        const existingVisitor = Visitors.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
        if (existingVisitor) {
          throw new Error(
            `This CNIC number is already set for ${existingVisitor.firstName} ${
              existingVisitor.lastName
            }.`
          );
        }
      }

      const date = new Date();
      const visitorId = Visitors.insert({
        firstName,
        lastName,
        cnicNumber,
        contactNumber1,
        contactNumber2,
        emailAddress,
        address,
        city,
        country,
        createdAt: date,
        createdBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      });

      return Visitors.findOne(visitorId);
    },

    updateVisitor(
      obj,
      {
        _id,
        firstName,
        lastName,
        cnicNumber,
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
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
        );
      }

      if (cnicNumber) {
        const existingVisitor = Visitors.findOne({
          cnicNumber: { $eq: cnicNumber },
        });
        if (existingVisitor && existingVisitor._id !== _id) {
          throw new Error(
            `This CNIC number is already set for ${existingVisitor.firstName} ${
              existingVisitor.lastName
            }.`
          );
        }
      }

      const date = new Date();
      Visitors.update(_id, {
        $set: {
          firstName,
          lastName,
          cnicNumber,
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

    deleteVisitor(obj, { _id }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
        );
      }

      return Visitors.remove(_id);
    },

    setVisitorImage(obj, { _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.SECURITY_MANAGE_VISITORS,
        ])
      ) {
        throw new Error(
          "You do not have permission to manage Visitors in the System."
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
