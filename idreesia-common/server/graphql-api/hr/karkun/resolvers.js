import { People } from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  canDeleteKarkun,
  deleteKarkun,
} from 'meteor/idreesia-common/server/business-logic/hr';
import { DataSource } from 'meteor/idreesia-common/constants';

export default {
  Query: {
    hrKarkunById(obj, { _id }) {
      const person = People.findOne(_id);
      return People.personToKarkun(person);
    },

    hrKarkunsById(obj, { _ids }) {
      const idsArray = _ids.split(',');
      const people = People.find({ _id: { $in: idsArray } }).fetch();
      return people.map(person => People.personToKarkun(person));
    },

    pagedHrKarkuns(obj, { filter }) {
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
      ).then(result => ({
        karkuns: result.data.map(person => People.personToKarkun(person)),
        totalResults: result.totalResults,
      }));
    },
  },

  Mutation: {
    createHrKarkun(obj, values, { user }) {
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

    updateHrKarkun(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    deleteHrKarkun(obj, { _id }) {
      if (canDeleteKarkun(_id)) {
        return deleteKarkun(_id);
      }

      return 0;
    },

    setHrKarkunWazaifAndRaabta(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunEmploymentInfo(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    setHrKarkunProfileImage(obj, values, { user }) {
      const personValues = People.karkunToPerson(values);
      const person = People.updatePerson(personValues, user);
      return People.personToKarkun(person);
    },

    addHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      const person = People.addAttachment({ _id, attachmentId }, user);
      return People.personToKarkun(person);
    },

    removeHrKarkunAttachment(obj, { _id, attachmentId }, { user }) {
      const person = People.removeAttachment({ _id, attachmentId }, user);
      return People.personToKarkun(person);
    },
  },
};
