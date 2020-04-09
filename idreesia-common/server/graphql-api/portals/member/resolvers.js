import { Visitors } from 'meteor/idreesia-common/server/collections/security';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getPortalMembers } from './queries';

export default {
  Query: {
    pagedPortalMembers(obj, { portalId, queryString }) {
      return getPortalMembers(portalId, queryString);
    },

    portalMemberById(obj, { _id }) {
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

    setPortalMemberImage(obj, { _id, imageId }, { user }) {
      return Visitors.updateVisitor({ _id, imageId }, user);
    },
  },
};
