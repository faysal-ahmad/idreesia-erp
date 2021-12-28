import moment from 'moment';

import { Formats } from 'meteor/idreesia-common/constants';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Person as PersonSchema } from 'meteor/idreesia-common/server/schemas/people';
import {
  AuditLogs,
  Attachments,
} from 'meteor/idreesia-common/server/collections/common';
import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import { get, forOwn, keys } from 'meteor/idreesia-common/utilities/lodash';

class People extends AggregatableCollection {
  constructor(name = 'common-people', options = {}) {
    const people = super(name, options);
    people.attachSchema(PersonSchema);
    return people;
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  createPerson(values, user) {
    const {
      dataSource,
      sharedData: { cnicNumber, contactNumber1, contactNumber2 },
    } = values;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2);
    if (!dataSource) {
      throw new Error('Data Source is required to create a person.');
    }

    const date = new Date();
    const valuesToInsert = Object.assign({}, values, {
      createdAt: date,
      createdBy: user._id,
      updatedAt: date,
      updatedBy: user._id,
    });

    const personId = this.insert(valuesToInsert);
    AuditLogs.createAuditLog({
      entityId: personId,
      entityType: EntityType.PERSON,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    return this.findOne(personId);
  }

  updatePerson(values, user) {
    const { _id } = values;
    const existingPerson = this.findOne(_id);
    const changedValues = this.getChangedValues(_id, values, existingPerson);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOne(_id);
    }

    const {
      sharedData: { cnicNumber, contactNumber1, contactNumber2, imageId },
    } = changedValues;
    if (cnicNumber) this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) this.checkContactNotInUse(contactNumber2, _id);

    if (imageId) {
      if (existingPerson.sharedData.imageId) {
        Attachments.removeAttachment(existingPerson.sharedData.imageId);
      }
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    this.update(_id, { $set: valuesToUpdate });

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.VISITOR,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingPerson
    );

    return this.findOne(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(_id, newPerson, existingPerson) {
    const changedValues = {};
    forOwn(newPerson.sharedData, (newValue, key) => {
      if (this.isValueChanged(key, newValue, existingPerson.sharedData[key])) {
        changedValues[`sharedData.${key}`] = newValue;
      }
    });

    if (newPerson.karkunData) {
      forOwn(newPerson.karkunData, (newValue, key) => {
        if (
          this.isValueChanged(key, newValue, existingPerson.karkunData[key])
        ) {
          changedValues[`karkunData.${key}`] = newValue;
        }
      });
    }

    if (newPerson.visitorData) {
      forOwn(newPerson.visitorData, (newValue, key) => {
        if (
          this.isValueChanged(key, newValue, existingPerson.visitorData[key])
        ) {
          changedValues[`visitorData.${key}`] = newValue;
        }
      });
    }

    if (newPerson.employeeData) {
      forOwn(newPerson.employeeData, (newValue, key) => {
        if (
          this.isValueChanged(key, newValue, existingPerson.employeeData[key])
        ) {
          changedValues[`employeeData.${key}`] = newValue;
        }
      });
    }

    return changedValues;
  }

  isValueChanged(key, newValue, existingValue) {
    if (!existingValue && !newValue) return false;
    let isChanged;

    switch (key) {
      case 'ehadDate':
      case 'birthDate':
        isChanged = !moment(existingValue).isSame(moment(newValue));
        break;

      default:
        isChanged = existingValue !== newValue;
        break;
    }

    return isChanged;
  }

  // **************************************************************
  // Custom Finder Methods
  // **************************************************************
  findByCnicOrContactNumber(cnicNumber, contactNumber) {
    let person = null;

    if (cnicNumber) {
      person = this.findOne({
        'sharedData.cnicNumber': { $eq: cnicNumber },
      });
    }

    if (person) return person;

    if (contactNumber) {
      person = this.findOne({
        $or: [
          { 'sharedData.contactNumber1': contactNumber },
          { 'sharedData.contactNumber2': contactNumber },
        ],
      });
    }

    return person;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  searchPeople(params = {}) {
    const pipeline = [];

    const {
      name,
      cnicNumber,
      phoneNumber,
      city,
      ehadDuration,
      ehadDate,
      additionalInfo,
      dataSource,
      updatedBetween,
      pageIndex = '0',
      pageSize = '20',
    } = params;

    if (name) {
      pipeline.push({
        $match: { $text: { $search: name } },
      });
    }

    if (dataSource) {
      pipeline.push({
        $match: {
          dataSource: { $regex: new RegExp(`^${dataSource}`, 'i') },
        },
      });
    }

    if (cnicNumber) {
      pipeline.push({
        $match: {
          'sharedData.cnicNumber': { $eq: cnicNumber },
        },
      });
    }

    if (phoneNumber) {
      pipeline.push({
        $match: {
          $or: [
            { 'sharedData.contactNumber1': phoneNumber },
            { 'sharedData.contactNumber2': phoneNumber },
          ],
        },
      });
    }

    if (city) {
      pipeline.push({
        $match: {
          'visitorData.city': { $eq: city },
        },
      });
    }

    if (ehadDate) {
      pipeline.push({
        $match: {
          'sharedData.ehadDate': {
            $eq: moment(ehadDate, Formats.DATE_FORMAT)
              .startOf('day')
              .toDate(),
          },
        },
      });
    }

    if (ehadDuration) {
      const { scale, duration } = JSON.parse(ehadDuration);
      if (duration) {
        const date = moment()
          .startOf('day')
          .subtract(duration, scale);

        pipeline.push({
          $match: {
            'sharedData.ehadDate': {
              $gte: moment(date).toDate(),
            },
          },
        });
      }
    }

    if (additionalInfo) {
      if (additionalInfo === 'has-notes') {
        pipeline.push({
          $match: {
            'visitorData.otherNotes': { $exists: true, $nin: ['', null] },
          },
        });
      } else if (additionalInfo === 'has-criminal-record') {
        pipeline.push({
          $match: {
            'visitorData.criminalRecord': { $exists: true, $nin: ['', null] },
          },
        });
      } else if (additionalInfo === 'has-notes-or-criminal-record') {
        pipeline.push({
          $match: {
            $or: [
              { 'visitorData.otherNotes': { $exists: true, $nin: ['', null] } },
              {
                'visitorData.criminalRecord': {
                  $exists: true,
                  $nin: ['', null],
                },
              },
            ],
          },
        });
      }
    }

    if (updatedBetween) {
      const updatedBetweenDates = JSON.parse(updatedBetween);

      if (updatedBetweenDates[0]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $gte: moment(updatedBetweenDates[0], Formats.DATE_FORMAT)
                .startOf('day')
                .toDate(),
            },
          },
        });
      }
      if (updatedBetweenDates[1]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $lte: moment(updatedBetweenDates[1], Formats.DATE_FORMAT)
                .endOf('day')
                .toDate(),
            },
          },
        });
      }
    }

    const countingPipeline = pipeline.concat({
      $count: 'total',
    });

    const nPageIndex = parseInt(pageIndex, 10);
    const nPageSize = parseInt(pageSize, 10);
    const resultsPipeline = pipeline.concat([
      { $sort: { 'sharedData.name': 1 } },
      { $skip: nPageIndex * nPageSize },
      { $limit: nPageSize },
    ]);

    const people = this.aggregate(resultsPipeline).toArray();
    const totalResults = this.aggregate(countingPipeline).toArray();

    return Promise.all([people, totalResults]).then(results => ({
      data: results[0],
      totalResults: get(results[1], ['0', 'total'], 0),
    }));
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  isCnicInUse(cnicNumber) {
    const person = this.findOne({
      'sharedData.cnicNumber': { $eq: cnicNumber },
    });

    if (person) return true;
    return false;
  }

  checkCnicNotInUse(cnicNumber, personId) {
    const person = this.findOne({
      'sharedData.cnicNumber': { $eq: cnicNumber },
    });

    if (person && (!personId || person._id !== personId)) {
      throw new Error(
        `This CNIC number is already set for ${person.sharedData.name}.`
      );
    }
  }

  isContactNumberInUse(contactNumber) {
    const person = this.findOne({
      $or: [
        { 'sharedData.contactNumber1': { $eq: contactNumber } },
        { 'sharedData.contactNumber2': { $eq: contactNumber } },
      ],
    });

    if (person) return true;
    return false;
  }

  checkContactNotInUse(contactNumber, personId) {
    const person = this.findOne({
      $or: [
        { 'sharedData.contactNumber1': { $eq: contactNumber } },
        { 'sharedData.contactNumber2': { $eq: contactNumber } },
      ],
    });

    if (person && (!personId || person._id !== personId)) {
      throw new Error(
        `This contact number is already set for ${person.sharedData.name}.`
      );
    }
  }
}

export default new People();
