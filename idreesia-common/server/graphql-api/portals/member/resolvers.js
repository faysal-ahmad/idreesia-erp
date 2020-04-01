import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import { Permissions as PermissionConstants } from 'meteor/idreesia-common/constants';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getPortalMembers } from './queries';

export default {
  Query: {
    pagedPortalMembers(obj, { portalId, queryString }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_VIEW_MEMBERS,
          PermissionConstants.PORTALS_MANAGE_MEMBERS,
        ])
      ) {
        return {
          data: [],
          totalResults: 0,
        };
      }

      return getPortalMembers(portalId, queryString);
    },

    portalMemberById(obj, { portalId, _id }, { user }) {
      if (
        hasInstanceAccess(user._id, portalId) === false ||
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
    createPortalMember(
      obj,
      {
        portalId,
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
          PermissionConstants.PORTALS_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Members in this Mehfil Portal.'
        );
      }

      return Visitors.createVisitor(
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
          dataSource: `${DataSource.PORTAL}-${portalId}`,
        },
        user
      );
    },

    updatePortalMember(
      obj,
      {
        portalId,
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
          PermissionConstants.PORTALS_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Members in this Mehfil Portal.'
        );
      }

      return Visitors.updateVisitor(
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
        user
      );
    },

    setPortalMemberImage(obj, { portalId, _id, imageId }, { user }) {
      if (
        !hasOnePermission(user._id, [
          PermissionConstants.PORTALS_MANAGE_MEMBERS,
        ])
      ) {
        throw new Error(
          'You do not have permission to manage Members in the System.'
        );
      }

      if (hasInstanceAccess(user._id, portalId) === false) {
        throw new Error(
          'You do not have permission to manage Members in this Mehfil Portal.'
        );
      }

      return Visitors.updateVisitor({ _id, imageId }, user);
    },
  },
};
