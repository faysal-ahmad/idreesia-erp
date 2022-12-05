import { People } from 'meteor/idreesia-common/server/collections/common';
import { DataSource } from 'meteor/idreesia-common/constants';

import { getPortalMembers } from './queries';

export default {
  Query: {
    pagedPortalMembers: async (obj, { portalId, queryString }) =>
      getPortalMembers(portalId, queryString),

    portalMemberById: async (obj, { _id }) => {
      const person = People.findOne(_id);
      return People.personToVisitor(person);
    },
  },

  Mutation: {
    createPortalMember: async (obj, values, { user }) => {
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

    updatePortalMember: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },

    setPortalMemberImage: async (obj, values, { user }) => {
      const personValues = People.visitorToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToVisitor(person);
    },
  },
};
