import moment from 'moment';
import { Formats } from 'meteor/idreesia-common/constants';
import { BloodGroups } from 'meteor/idreesia-common/constants/hr';
import {
  EntityType,
  OperationType,
} from 'meteor/idreesia-common/constants/audit';
import { AggregatableCollection } from 'meteor/idreesia-common/server/collections';
import { Person as PersonSchema } from 'meteor/idreesia-common/server/schemas/people';
import {
  AuditLogs,
  Attachments,
} from 'meteor/idreesia-common/server/collections/common';
import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  forOwn,
  get,
  isNil,
  isUndefined,
  keys,
  omitBy,
} from 'meteor/idreesia-common/utilities/lodash';

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

    const cnicNumber = changedValues['sharedData.cnicNumber'];
    const contactNumber1 = changedValues['sharedData.contactNumber1'];
    const contactNumber2 = changedValues['sharedData.contactNumber2'];
    const imageId = changedValues['sharedData.imageId'];
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
    const topLevelProps = ['isVisitor', 'isKarkun', 'isEmployee', 'userId'];
    topLevelProps.forEach(prop => {
      const newValue = newPerson[prop];
      if (
        !isNil(newValue) &&
        this.isValueChanged(prop, newValue, existingPerson?.[prop])
      ) {
        changedValues[prop] = newValue;
      }
    });

    forOwn(newPerson.sharedData, (newValue, key) => {
      if (
        this.isValueChanged(key, newValue, existingPerson?.sharedData?.[key])
      ) {
        changedValues[`sharedData.${key}`] = newValue;
      }
    });

    if (newPerson.karkunData) {
      forOwn(newPerson.karkunData, (newValue, key) => {
        if (
          this.isValueChanged(key, newValue, existingPerson?.karkunData?.[key])
        ) {
          changedValues[`karkunData.${key}`] = newValue;
        }
      });
    }

    if (newPerson.visitorData) {
      forOwn(newPerson.visitorData, (newValue, key) => {
        if (
          this.isValueChanged(key, newValue, existingPerson?.visitorData?.[key])
        ) {
          changedValues[`visitorData.${key}`] = newValue;
        }
      });
    }

    if (newPerson.employeeData) {
      forOwn(newPerson.employeeData, (newValue, key) => {
        if (
          this.isValueChanged(
            key,
            newValue,
            existingPerson?.employeeData?.[key]
          )
        ) {
          changedValues[`employeeData.${key}`] = newValue;
        }
      });
    }

    return changedValues;
  }

  isValueChanged(key, newValue, existingValue) {
    if (isNil(existingValue) && isNil(newValue)) return false;
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
  buildSearchPipline(params = {}, flags = {}) {
    const pipeline = [];
    const includeKarkuns = isNil(flags.includeKarkuns)
      ? false
      : flags.includeKarkuns;
    const includeEmployees = isNil(flags.includeEmployees)
      ? false
      : flags.includeEmployees;
    const includeVisitors = isNil(flags.includeVisitors)
      ? false
      : flags.includeVisitors;

    const {
      name,
      cnicNumber,
      phoneNumber,
      phoneNumbers,
      bloodGroup,
      ehadDate,
      ehadDuration,
      dataSource,
      updatedBetween,
      // visitor related fields
      city,
      cityNames,
      additionalInfo,
      // karkun related fields
      lastTarteeb,
      attendance,
      dutyId,
      dutyIds,
      dutyShiftId,
      ehadKarkun,
      cityId,
      cityIds,
      cityMehfilId,
      region,
      // employee related fields
      jobId,
      jobIds,
    } = params;

    // ************************************
    // Add criteria for shared data fields
    // ************************************
    if (name) {
      pipeline.push({
        $match: { $text: { $search: name } },
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
    } else if (phoneNumbers) {
      pipeline.push({
        $match: {
          $or: [
            { 'sharedData.contactNumber1': { $in: phoneNumbers } },
            { 'sharedData.contactNumber2': { $in: phoneNumbers } },
          ],
        },
      });
    }

    if (bloodGroup) {
      const convertedBloodGroupValue = BloodGroups[bloodGroup];
      pipeline.push({
        $match: {
          'sharedData.bloodGroup': { $eq: convertedBloodGroupValue },
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

    if (dataSource) {
      pipeline.push({
        $match: {
          dataSource: { $regex: new RegExp(`^${dataSource}`, 'i') },
        },
      });
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

    // ************************************
    // Add criteria for visitor data fields
    // ************************************
    if (includeVisitors) {
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
                {
                  'visitorData.otherNotes': { $exists: true, $nin: ['', null] },
                },
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
    }

    // ************************************
    // Add criteria for karkun data fields
    // ************************************
    if (includeKarkuns) {
      if (ehadKarkun) {
        const ehadKarkunValue = ehadKarkun === 'true';
        pipeline.push({
          $match: {
            'karkunData.ehadKarkun': { $eq: ehadKarkunValue },
          },
        });
      }

      if (lastTarteeb) {
        const { scale, duration } = JSON.parse(lastTarteeb);
        if (duration) {
          const date = moment()
            .startOf('day')
            .subtract(duration, scale);

          pipeline.push({
            $match: {
              $or: [
                { 'karkunData.lastTarteebDate': { $exists: false } },
                {
                  'karkunData.lastTarteebDate': { $lte: moment(date).toDate() },
                },
              ],
            },
          });
        }
      }

      if (attendance) {
        const { criteria, percentage } = JSON.parse(attendance);
        if (percentage) {
          const month = moment()
            .subtract(1, 'month')
            .startOf('month');

          const criteriaCondition =
            criteria === 'less-than'
              ? {
                  $lte: ['$percentage', percentage],
                }
              : {
                  $gte: ['$percentage', percentage],
                };

          pipeline.push({
            $lookup: {
              from: 'hr-attendances',
              let: { karkun_id: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $eq: ['$karkunId', '$$karkun_id'],
                        },
                        {
                          $eq: ['$month', month.format('MM-YYYY')],
                        },
                        criteriaCondition,
                      ],
                    },
                  },
                },
              ],
              as: 'attendances',
            },
          });

          pipeline.push({
            $match: {
              $expr: {
                $gte: [{ $size: '$attendances' }, 1],
              },
            },
          });
        }
      }

      if (cityId) {
        pipeline.push({
          $match: {
            'karkunData.cityId': { $eq: cityId },
          },
        });
      } else if (cityIds) {
        pipeline.push({
          $match: {
            'karkunData.cityId': { $in: cityIds },
          },
        });
      } else if (region) {
        const regionCities = Cities.find({ region });
        const regionCityIds = regionCities.map(({ _id }) => _id);
        pipeline.push({
          $match: {
            'karkunData.cityId': { $in: regionCityIds },
          },
        });
      }

      if (cityMehfilId) {
        pipeline.push({
          $match: {
            'karkunData.cityMehfilId': { $eq: cityMehfilId },
          },
        });
      }

      if (dutyId || (dutyIds && dutyIds.length > 0)) {
        pipeline.push({
          $lookup: {
            from: 'hr-karkun-duties',
            localField: '_id',
            foreignField: 'karkunId',
            as: 'duties',
          },
        });

        const dutyIdsToSearch = dutyId ? [dutyId] : dutyIds;
        pipeline.push({
          $match: {
            duties: {
              $elemMatch: {
                dutyId: { $in: dutyIdsToSearch },
              },
            },
          },
        });

        if (dutyShiftId) {
          pipeline.push({
            $match: {
              duties: {
                $elemMatch: {
                  shiftId: { $eq: dutyShiftId },
                },
              },
            },
          });
        }
      }
    }

    // ************************************
    // Add criteria for employee data fields
    // ************************************
    if (jobId) {
      pipeline.push({
        $match: {
          'employeeData.jobId': { $eq: jobId },
        },
      });
    } else if (jobIds && jobIds.length > 0) {
      pipeline.push({
        $match: {
          'employeeData.jobId': { $in: jobIds },
        },
      });
    }

    // ************************************
    // Add filters against passed flags
    // ************************************
    const conditions = [];
    if (includeKarkuns) {
      conditions.push({ isKarkun: true });
    }
    if (includeEmployees) {
      conditions.push({ isEmployee: true });
    }
    if (includeVisitors) {
      conditions.push({ isVisitor: true });
    }

    if (conditions.length === 1) {
      pipeline.push({
        $match: conditions[0],
      });
    } else if (conditions.length > 1) {
      pipeline.push({
        $match: {
          $or: conditions,
        },
      });
    }

    return pipeline;
  }

  /**
   * flags contains the following
   * - includeKarkuns - defaults to false
   * - includeEmployees - defaults to false
   * - includeVisitors - defaults to false
   * - paginatedResults - defaults to true
   */
  searchPeople(params = {}, flags = {}) {
    const pipeline = this.buildSearchPipline(params, flags);
    const { pageIndex = '0', pageSize = '20' } = params;
    const paginatedResults = !isNil(flags.paginatedResults)
      ? flags.paginatedResults
      : true;

    if (paginatedResults) {
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

    // Return the full results without pagination
    return this.aggregate(pipeline).toArray();
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
      isKarkun: person.isKarkun,
    };
  }

  visitorToPerson(visitor) {
    let person = {
      _id: visitor._id,
      isVisitor: true,
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
        contactNumber1Subscribed: visitor.contactNumber1Subscribed,
        contactNumber2Subscribed: visitor.contactNumber2Subscribed,
        currentAddress: visitor.currentAddress,
        permanentAddress: visitor.permanentAddress,
        educationalQualification: visitor.educationalQualification,
        meansOfEarning: visitor.meansOfEarning,
        imageId: visitor.imageId,
      },
      visitorData: {
        city: visitor.city,
        country: visitor.country,
        criminalRecord: visitor.criminalRecord,
        otherNotes: visitor.otherNotes,
      },
    };

    person.sharedData = omitBy(person.sharedData, isNil);
    person.visitorData = omitBy(person.visitorData, isNil);
    person = omitBy(person, isNil);
    return person;
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
    const city = karkun.cityId ? Cities.findOne(karkun.cityId) : null;

    let person = {
      _id: karkun._id,
      isKarkun: true,
      isEmployee: karkun.isEmployee,
      dataSource: karkun.dataSource,
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
      visitorData: city
        ? {
            city: city.name,
            country: city.country,
          }
        : null,
    };

    person.sharedData = omitBy(person.sharedData, isUndefined);
    person.karkunData = omitBy(person.karkunData, isUndefined);
    person.employeeData = omitBy(person.employeeData, isUndefined);
    person.visitorData = omitBy(person.visitorData, isUndefined);
    person = omitBy(person, isUndefined);
    return person;
  }
}

export default new People();
