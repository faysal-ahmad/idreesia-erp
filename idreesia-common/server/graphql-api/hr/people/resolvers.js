import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  canDeletePerson,
  deletePerson,
} from 'meteor/idreesia-common/server/business-logic/common';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    hrPersonById: async (obj, { _id }) => People.findOne(_id),

    hrpeopleByIds: async (obj, { _ids }) => {
      const idsArray = _ids.split(',');
      return People.find({ _id: { $in: idsArray } }).fetch();
    },

    pagedHrPeople: async (obj, { filter }) => {
      const multanCity = Cities.findOne({
        name: 'Multan',
        country: 'Pakistan',
      });
      return People.searchPeople(
        {
          ...filter,
          cityId: multanCity._id,
        },
        {
          includeVisitors: filter.showVolunteers === 'true',
          includeKarkuns: filter.showVolunteers === 'true',
          includeEmployees: filter.showEmployees === 'true',
        }
      );
    },
  },

  Mutation: {
    createHrPerson: async (obj, values, { user }) => {
      const multanCity = Cities.getMultanCity();
      const personValues = People.karkunToPerson({
        ...values,
        isKarkun: true,
        isVisitor: true,
        cityId: multanCity._id,
        dataSource: DataSource.HR,
        visitorData: {
          city: multanCity.name,
          country: multanCity.country,
        },
      });
      const person = People.createPerson(personValues, user);
      return People.personToKarkun(person);
    },

    updateHrKarkun: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    deleteHrKarkun: async (obj, { _id }) => {
      if (canDeletePerson(_id)) {
        return deletePerson(_id);
      }

      return 0;
    },

    setHrKarkunWazaifAndRaabta: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunEmploymentInfo: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunProfileImage: async (obj, values, { user }) => {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    addHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) => {
      const person = People.addAttachment({ _id, attachmentId }, user);
      return People.personToKarkun(person);
    },

    removeHrKarkunAttachment: async (obj, { _id, attachmentId }, { user }) => {
      const person = People.removeAttachment({ _id, attachmentId }, user);
      return People.personToKarkun(person);
    },
  },
};
