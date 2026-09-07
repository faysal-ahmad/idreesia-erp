import {
  add,
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  isEqual,
  startOfDay,
  startOfMonth,
} from 'date-fns';
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
import { generateImageThumbnail } from 'meteor/idreesia-common/server/business-logic/common/generate-image-thumbnail';
import {
  forOwn,
  get,
  isNil,
  isUndefined,
  keys,
  omitBy,
} from 'meteor/idreesia-common/utilities/lodash';
import { parseDate } from 'meteor/idreesia-common/utilities/date-fns';

type LooseRecord = Record<string, any>;

interface UserRef {
  _id: string;
}

interface PersonDocument extends LooseRecord {
  _id: string;
  dataSource?: string;
  isVisitor?: boolean;
  isKarkun?: boolean;
  isEmployee?: boolean;
  userId?: string;
  createdAt?: Date;
  createdBy?: string;
  updatedAt?: Date;
  updatedBy?: string;
  deletedAt?: Date;
  deletedBy?: string;
  sharedData: LooseRecord;
  visitorData?: LooseRecord | null;
  karkunData?: LooseRecord | null;
  employeeData?: LooseRecord | null;
}

type PersonInput = LooseRecord & {
  _id?: string;
  dataSource?: string;
  sharedData?: LooseRecord;
  visitorData?: LooseRecord;
  karkunData?: LooseRecord;
  employeeData?: LooseRecord;
};

interface AttachmentInput {
  _id: string;
  attachmentId: string;
}

interface SearchFlags {
  includeKarkuns?: boolean;
  includeEmployees?: boolean;
  includeVisitors?: boolean;
  paginatedResults?: boolean;
  onlyDeleted?: boolean;
}

interface CountResult {
  total: number;
}

class People extends AggregatableCollection<PersonDocument> {
  constructor(name = 'common-people', options = {}) {
    super(name, options);
    this.attachSchema(PersonSchema);
  }

  // **************************************************************
  // Create/Update Methods
  // **************************************************************
  async createPerson(values: PersonInput, user: UserRef) {
    const {
      dataSource,
      sharedData = {},
    } = values;
    const { cnicNumber, contactNumber1, contactNumber2 } = sharedData;
    if (cnicNumber) await this.checkCnicNotInUse(cnicNumber);
    if (contactNumber1) await this.checkContactNotInUse(contactNumber1);
    if (contactNumber2) await this.checkContactNotInUse(contactNumber2);
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

    const personId = await this.insertAsync(valuesToInsert);
    await AuditLogs.createAuditLog({
      entityId: personId,
      entityType: EntityType.PERSON,
      operationType: OperationType.CREATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: values,
    });

    return this.findOneAsync(personId);
  }

  async updatePerson(values: PersonInput, user: UserRef) {
    const { _id } = values;
    if (!_id) {
      throw new Error('Person id is required.');
    }
    const existingPerson = await this.findOneAsync(_id);
    const changedValues = this.getChangedValues(_id, values, existingPerson);

    if (keys(changedValues).length === 0) {
      // Nothing actually changed
      return this.findOneAsync(_id);
    }

    const cnicNumber = changedValues['sharedData.cnicNumber'];
    const contactNumber1 = changedValues['sharedData.contactNumber1'];
    const contactNumber2 = changedValues['sharedData.contactNumber2'];
    const imageId = changedValues['sharedData.imageId'];
    if (cnicNumber) await this.checkCnicNotInUse(cnicNumber, _id);
    if (contactNumber1) await this.checkContactNotInUse(contactNumber1, _id);
    if (contactNumber2) await this.checkContactNotInUse(contactNumber2, _id);

    if (imageId) {
      if (existingPerson?.sharedData.imageId) {
        await Attachments.removeAttachment(existingPerson.sharedData.imageId);
      }
      if (existingPerson?.sharedData.imageThumbnailId) {
        await Attachments.removeAttachment(
          existingPerson.sharedData.imageThumbnailId
        );
      }

      const thumbnailId = await generateImageThumbnail(imageId);
      if (thumbnailId) {
        changedValues['sharedData.imageThumbnailId'] = thumbnailId;
      }
    }

    const date = new Date();
    const valuesToUpdate = Object.assign({}, changedValues, {
      updatedAt: date,
      updatedBy: user._id,
    });

    await this.updateAsync(_id, { $set: valuesToUpdate });

    await AuditLogs.createAuditLog(
      {
        entityId: _id,
        entityType: EntityType.PERSON,
        operationType: OperationType.UPDATE,
        operationBy: user._id,
        operationTime: date,
        auditValues: changedValues,
      },
      existingPerson || null
    );

    return this.findOneAsync(_id);
  }

  async removePerson(_id: string, user: UserRef) {
    const date = new Date();
    const result = await this.updateAsync(_id, {
      $set: {
        deletedAt: date,
        deletedBy: user._id,
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: date,
    });

    return result;
  }

  async hardRemovePerson(_id: string, user: UserRef) {
    const date = new Date();
    const result = await this.removeAsync(_id);

    await AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.DELETE,
      operationBy: user._id,
      operationTime: date,
    });

    return result;
  }

  async addAttachment({ _id, attachmentId }: AttachmentInput, user: UserRef) {
    const date = new Date();
    await this.updateAsync(_id, {
      $addToSet: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await AuditLogs.createAuditLog({
      entityId: _id,
      entityType: EntityType.PERSON,
      operationType: OperationType.UPDATE,
      operationBy: user._id,
      operationTime: date,
      auditValues: { attachmentId },
    });

    return this.findOneAsync(_id);
  }

  async removeAttachment(
    { _id, attachmentId }: AttachmentInput,
    user: UserRef
  ) {
    const date = new Date();
    await this.updateAsync(_id, {
      $pull: {
        'karkunData.attachmentIds': attachmentId,
      },
      $set: {
        updatedAt: date,
        updatedBy: user._id,
      },
    });

    await Attachments.removeAttachment(attachmentId);

    await AuditLogs.createAuditLog(
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

    return this.findOneAsync(_id);
  }

  // Iterate through the incoming changed values and check which of the
  // values have actually changed.
  getChangedValues(
    _id: string,
    newPerson: PersonInput,
    existingPerson: PersonDocument | undefined
  ) {
    const changedValues: LooseRecord = {};
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

  isValueChanged(key: string, newValue: unknown, existingValue: unknown) {
    if (isNil(existingValue) && isNil(newValue)) return false;
    let isChanged;

    switch (key) {
      case 'ehadDate':
      case 'birthDate':
      case 'lastTarteebDate':
      case 'employmentStartDate':
      case 'employmentEndDate':
        isChanged = !isEqual(
          new Date(existingValue as string | number | Date),
          new Date(newValue as string | number | Date)
        );
        break;

      case 'tagIds':
        isChanged =
          [...((existingValue as string[]) ?? [])].sort().join(',') !==
          [...((newValue as string[]) ?? [])].sort().join(',');
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
  async findByCnicOrContactNumber(cnicNumber?: string, contactNumber?: string) {
    let person: PersonDocument | null | undefined = null;

    if (cnicNumber) {
      person = await this.findOneAsync({
        'sharedData.cnicNumber': { $eq: cnicNumber },
        deletedAt: { $exists: false },
      });
    }

    if (person) return person;

    if (contactNumber) {
      person = await this.findOneAsync({
        $or: [
          { 'sharedData.contactNumber1': contactNumber },
          { 'sharedData.contactNumber2': contactNumber },
        ],
        deletedAt: { $exists: false },
      });
    }

    return person;
  }

  // **************************************************************
  // Query Functions
  // **************************************************************
  async buildSearchPipline(params: LooseRecord = {}, flags: SearchFlags = {}) {
    const pipeline: LooseRecord[] = [];
    pipeline.push({
      $match: { deletedAt: { $exists: Boolean(flags.onlyDeleted) } },
    });

    const includeKarkuns = isNil(flags.includeKarkuns)
      ? false
      : flags.includeKarkuns;
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
      ehadMonth,
      ehadDuration,
      dataSource,
      updatedBetween,
      tagId,
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
      // user account related fileds
      userAccount,
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
      const convertedBloodGroupValue =
        BloodGroups[bloodGroup as keyof typeof BloodGroups];
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
            $eq: startOfDay(parseDate(ehadDate, Formats.DATE_FORMAT)),
          },
        },
      });
    }

    if (ehadMonth) {
      pipeline.push({
        $match: {
          'sharedData.ehadDate': {
            $gte: startOfMonth(parseDate(ehadMonth, Formats.MONTH_FORMAT)),
          },
        },
      });
      pipeline.push({
        $match: {
          'sharedData.ehadDate': {
            $lte: endOfMonth(parseDate(ehadMonth, Formats.MONTH_FORMAT)),
          },
        },
      });
    }

    if (ehadDuration) {
      const { scale, duration } = JSON.parse(ehadDuration);
      if (duration) {
        const date = add(startOfDay(new Date()), { [scale]: -duration });

        pipeline.push({
          $match: {
            'sharedData.ehadDate': {
              $gte: date,
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

    if (tagId) {
      pipeline.push({
        $match: {
          'sharedData.tagIds': { $eq: tagId },
        },
      });
    }

    if (updatedBetween) {
      const updatedBetweenDates = JSON.parse(updatedBetween);

      if (updatedBetweenDates[0]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $gte: startOfDay(
                parseDate(updatedBetweenDates[0], Formats.DATE_FORMAT)
              ),
            },
          },
        });
      }
      if (updatedBetweenDates[1]) {
        pipeline.push({
          $match: {
            updatedAt: {
              $lte: endOfDay(
                parseDate(updatedBetweenDates[1], Formats.DATE_FORMAT)
              ),
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
          const date = add(startOfDay(new Date()), { [scale]: -duration });

          pipeline.push({
            $match: {
              $or: [
                { 'karkunData.lastTarteebDate': { $exists: false } },
                {
                  'karkunData.lastTarteebDate': { $lte: date },
                },
              ],
            },
          });
        }
      }

      if (attendance) {
        const { criteria, percentage } = JSON.parse(attendance);
        if (percentage) {
          const month = startOfMonth(addMonths(new Date(), -1));

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
                          $eq: ['$month', format(month, 'MM-yyyy')],
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
        const regionCities = await Cities.find({ region }).fetchAsync();
        const regionCityIds = regionCities
          .map((city: { _id?: string }) => city._id)
          .filter((cityId: string | undefined): cityId is string =>
            Boolean(cityId)
          );
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

    // ********************************************
    // Add criteria for user account related fields
    // ********************************************
    if (userAccount) {
      const userAccountValue = userAccount === 'true';
      pipeline.push({
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'personId',
          as: 'users',
        },
      });

      if (userAccountValue) {
        pipeline.push({
          $match: {
            'users.0': { $exists: true },
          },
        });
      } else {
        pipeline.push({
          $match: {
            'users.0': { $exists: false },
          },
        });
      }
    }

    // ************************************
    // Add filters against passed flags
    // Each flag is tri-state: true ORs the tag into the match, false
    // excludes it (AND NOT), and undefined/omitted ignores it entirely.
    // ************************************
    const orConditions: LooseRecord[] = [];
    const notConditions: LooseRecord[] = [];

    if (flags.includeKarkuns === true) {
      orConditions.push({ isKarkun: true });
    } else if (flags.includeKarkuns === false) {
      notConditions.push({ isKarkun: { $ne: true } });
    }
    if (flags.includeEmployees === true) {
      orConditions.push({ isEmployee: true });
    } else if (flags.includeEmployees === false) {
      notConditions.push({ isEmployee: { $ne: true } });
    }
    if (flags.includeVisitors === true) {
      orConditions.push({ isVisitor: true });
    } else if (flags.includeVisitors === false) {
      notConditions.push({ isVisitor: { $ne: true } });
    }

    let matchStage: LooseRecord | undefined;
    if (orConditions.length === 1) {
      matchStage = orConditions[0];
    } else if (orConditions.length > 1) {
      matchStage = { $or: orConditions };
    }

    if (notConditions.length > 0) {
      const notStage =
        notConditions.length === 1 ? notConditions[0] : { $and: notConditions };
      matchStage = matchStage ? { $and: [matchStage, notStage] } : notStage;
    }

    if (matchStage) {
      pipeline.push({ $match: matchStage });
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
  async searchPeople(params: LooseRecord = {}, flags: SearchFlags = {}) {
    const pipeline = await this.buildSearchPipline(params, flags);
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

      const people = this.aggregate<PersonDocument>(resultsPipeline);
      const totalResults = this.aggregate<CountResult>(countingPipeline);

      return Promise.all([people, totalResults]).then(results => ({
        data: results[0],
        totalResults: get(results[1], ['0', 'total'], 0),
      }));
    }

    // Return the full results without pagination
    return this.aggregate(pipeline);
  }

  // **************************************************************
  // Utility Functions
  // **************************************************************
  async isCnicInUse(cnicNumber: string) {
    const person = await this.findOneAsync({
      'sharedData.cnicNumber': { $eq: cnicNumber },
      deletedAt: { $exists: false },
    });

    if (person) return true;
    return false;
  }

  async checkCnicNotInUse(cnicNumber: string, personId?: string) {
    const person = await this.findOneAsync({
      'sharedData.cnicNumber': { $eq: cnicNumber },
      deletedAt: { $exists: false },
    });

    if (person && (!personId || person._id !== personId)) {
      throw new Error(
        `This CNIC number is already set for ${person.sharedData.name}.`
      );
    }
  }

  async isContactNumberInUse(contactNumber: string) {
    const person = await this.findOneAsync({
      $or: [
        { 'sharedData.contactNumber1': { $eq: contactNumber } },
        { 'sharedData.contactNumber2': { $eq: contactNumber } },
      ],
      deletedAt: { $exists: false },
    });

    if (person) return true;
    return false;
  }

  async checkContactNotInUse(contactNumber: string, personId?: string) {
    const person = await this.findOneAsync({
      $or: [
        { 'sharedData.contactNumber1': { $eq: contactNumber } },
        { 'sharedData.contactNumber2': { $eq: contactNumber } },
      ],
      deletedAt: { $exists: false },
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
  visitorToPerson(visitor: LooseRecord) {
    let person: LooseRecord = {
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

  async karkunToPerson(karkun: LooseRecord) {
    const city = karkun.cityId ? await Cities.findOneAsync(karkun.cityId) : null;

    let person: LooseRecord = {
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
        bankAccountDetails: karkun.bankAccountDetails,
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
