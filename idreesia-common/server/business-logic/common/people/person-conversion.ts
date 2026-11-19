import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
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
  const cityLocation = karkun.cityLocationId
    ? await OrgLocations.findOneAsync(karkun.cityLocationId)
    : null;
  const countryLocation = cityLocation
    ? await OrgLocations.findOneAsync({
        _id: { $in: cityLocation.allParentIds ?? [] },
        type: OrgLocationTypes.COUNTRY,
      })
    : null;

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
    },
    karkunData: {
      cityLocationId: karkun.cityLocationId,
      mehfilLocationId: karkun.mehfilLocationId,
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
    visitorData: cityLocation
      ? {
          city: cityLocation.name,
          country: countryLocation?.name,
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
