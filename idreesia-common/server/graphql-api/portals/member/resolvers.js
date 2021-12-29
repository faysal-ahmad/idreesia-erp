import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getPortalMembers } from './queries';

export default {
  Query: {
    pagedPortalMembers(obj, { portalId, queryString }) {
      return getPortalMembers(portalId, queryString);
    },

    portalMemberById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    createPortalMember(obj, values, { user }) {
      const { portalId } = values;
      const personValues = People.visitorToPerson(values);
      const person = People.createPerson(
        {
          ...personValues,
          dataSource: `${DataSource.PORTAL}-${portalId}`,
        },
        user
      );
      return People.personToVisitor(person);
    },

    updatePortalMember(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    setPortalMemberImage(obj, values, { user }) {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },
  },
};
