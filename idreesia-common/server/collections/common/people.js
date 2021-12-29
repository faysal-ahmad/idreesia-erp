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
        entityType: EntityType.PERSON,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingPerson
    );

    return this.findOne(_id);
  }

  addAttachment({ _id, attachmentId }, user) {
    const date = new Date();
    this.update(_id, {
      $addToSet: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: { attachmentId },
    });

    return this.findOne(_id);
  }

  removeAttachment({ _id, attachmentId }, user) {
    const date = new Date();
    this.update(_id, {
      $pull: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    Attachments.removeAttachment(attachmentId);

    AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PERSON,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: { attachmentId: null },
      },
      {
        attachmentId,
      }
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
      case 'lastTarteebDate':
      case 'employmentStartDate':
      case 'employmentEndDate':
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
      cityNames,
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
    } else if (cityNames) {
      pipeline.push({
        $match: {
          'visitorData.city': { $in: cityNames },
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

  // **************************************************************
  // Conversion Functions
  // **************************************************************
  personToVisitor(person) {
    return {
      _id: person._id,
      dataSource: person.dataSource,
      createdAt: person.createdAt,
      createdBy: person.createdBy,
      updatedAt: person.updatedAt,
      updatedBy: person.updatedBy,

      name: person.sharedData.name,
      parentName: person.sharedData.parentName,
      cnicNumber: person.sharedData.cnicNumber,
      ehadDate: person.sharedData.ehadDate,
      birthDate: person.sharedData.birthDate,
      referenceName: person.sharedData.referenceName,
      contactNumber1: person.sharedData.contactNumber1,
      contactNumber2: person.sharedData.contactNumber2,
      contactNumber1Subscribed: person.sharedData.contactNumber1Subscribed,
      contactNumber2Subscribed: person.sharedData.contactNumber2Subscribed,
      currentAddress: person.sharedData.currentAddress,
      permanentAddress: person.sharedData.permanentAddress,
      educationalQualification: person.sharedData.educationalQualification,
      meansOfEarning: person.sharedData.meansOfEarning,
      imageId: person.sharedData.imageId,

      city: person.visitorData?.city,
      country: person.visitorData?.country,
      criminalRecord: person.visitorData?.criminalRecord,
      otherNotes: person.visitorData?.otherNotes,

      karkunId: person.karkunData?.karkunId,
    };
  }

  visitorToPerson(visitor) {
    return {
      _id: visitor._id,
      dataSource: visitor.dataSource,
      sharedData: {
        name: visitor.name,
        parentName: visitor.parentName,
        cnicNumber: visitor.cnicNumber,
        ehadDate: visitor.ehadDate,
        birthDate: visitor.birthDate,
        referenceName: visitor.referenceName,
        contactNumber1: visitor.contactNumber1,
        contactNumber2: visitor.contactNumber2,
        currentAddress: visitor.currentAddress,
        permanentAddress: visitor.permanentAddress,
        educationalQualification: visitor.educationalQualification,
        meansOfEarning: visitor.meansOfEarning,
      },
      visitorData: {
        city: visitor.city,
        country: visitor.country,
      },
    };
  }

  personToKarkun(person) {
    return {
      _id: person._id,
      dataSource: person.dataSource,
      createdAt: person.createdAt,
      createdBy: person.createdBy,
      updatedAt: person.updatedAt,
      updatedBy: person.updatedBy,

      name: person.sharedData.name,
      parentName: person.sharedData.parentName,
      cnicNumber: person.sharedData.cnicNumber,
      ehadDate: person.sharedData.ehadDate,
      birthDate: person.sharedData.birthDate,
      deathDate: person.sharedData.deathDate,
      referenceName: person.sharedData.referenceName,
      contactNumber1: person.sharedData.contactNumber1,
      contactNumber2: person.sharedData.contactNumber2,
      contactNumber1Subscribed: person.sharedData.contactNumber1Subscribed,
      contactNumber2Subscribed: person.sharedData.contactNumber2Subscribed,
      emailAddress: person.sharedData.emailAddress,
      currentAddress: person.sharedData.currentAddress,
      permanentAddress: person.sharedData.permanentAddress,
      bloodGroup: person.sharedData.bloodGroup,
      educationalQualification: person.sharedData.educationalQualification,
      meansOfEarning: person.sharedData.meansOfEarning,
      imageId: person.sharedData.imageId,

      cityId: person.karkunData?.cityId,
      cityMehfilId: person.karkunData?.cityMehfilId,
      ehadKarkun: person.karkunData?.ehadKarkun,
      ehadPermissionDate: person.karkunData?.ehadPermissionDate,
      lastTarteebDate: person.karkunData?.lastTarteebDate,
      mehfilRaabta: person.karkunData?.mehfilRaabta,
      msRaabta: person.karkunData?.msRaabta,
      msLastVisitDate: person.karkunData?.msLastVisitDate,
      attachmentIds: person.karkunData?.attachmentIds,

      isEmployee: person.isEmployee,
      jobId: person.employeeData?.jobId,
      employmentStartDate: person.employeeData?.employmentStartDate,
      employmentEndDate: person.employeeData?.employmentEndDate,
    };
  }

  karkunToPerson(karkun) {
    return {
      _id: karkun._id,
      isKarkun: true,
      isEmployee: karkun.isEmployee,
      sharedData: {
        name: karkun.name,
        parentName: karkun.parentName,
        cnicNumber: karkun.cnicNumber,
        ehadDate: karkun.ehadDate,
        birthDate: karkun.birthDate,
        deathDate: karkun.deathDate,
        referenceName: karkun.referenceName,
        contactNumber1: karkun.contactNumber1,
        contactNumber2: karkun.contactNumber2,
        contactNumber1Subscribed: karkun.contactNumber1Subscribed,
        contactNumber2Subscribed: karkun.contactNumber2Subscribed,
        emailAddress: karkun.emailAddress,
        currentAddress: karkun.currentAddress,
        permanentAddress: karkun.permanentAddress,
        bloodGroup: karkun.bloodGroup,
        educationalQualification: karkun.educationalQualification,
        meansOfEarning: karkun.meansOfEarning,
        imageId: karkun.imageId,
      },
      karkunData: {
        cityId: karkun.cityId,
        cityMehfilId: karkun.cityMehfilId,
        ehadKarkun: karkun.ehadKarkun,
        ehadPermissionDate: karkun.ehadPermissionDate,
        lastTarteebDate: karkun.lastTarteebDate,
        mehfilRaabta: karkun.mehfilRaabta,
        msRaabta: karkun.msRaabta,
        msLastVisitDate: karkun.msLastVisitDate,
        attachmentIds: karkun.attachmentIds,
      },
      employeeData: {
        jobId: karkun.jobId,
        employmentStartDate: karkun.employmentStartDate,
        employmentEndDate: karkun.employmentEndDate,
      },
    };
  }
}

export default new People();
