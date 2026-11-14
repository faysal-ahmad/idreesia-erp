import { Cities } from 'meteor/idreesia-common/server/collections/outstation';
import {
  isNil,
  isUndefined,
  omitBy,
} from 'meteor/idreesia-common/utilities/lodash';

type LooseRecord = Record<string, any>;

/** Maps flat visitor form values to a person document. */
export function visitorToPerson(visitor: LooseRecord) {
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
      tagIds: visitor.tagIds,
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

/** Maps flat karkun form values to a person document. */
export async function karkunToPerson(karkun: LooseRecord) {
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
