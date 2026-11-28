import { People } from 'meteor/idreesia-common/server/collections/common';

import { karkunToPerson } from '../common/people/person-conversion';
import { findMultanCityLocation } from '../common/people/picker-people';
import { searchPeople } from '../common/people/search-people';
import {
  addPersonAttachment,
  removePersonAttachment,
  updatePerson,
} from '../common/people/people-mutations';
import { setPersonImage } from '../common/set-person-image';
import { hrError } from './errors';
import {
  isHrEmployee,
  isHrKarkun,
  type HrPersonFlags,
  type HrPersonRole,
} from './hr-person-roles';

export {
  HR_EMPLOYEE_SELECTOR,
  HR_KARKUN_SELECTOR,
  isHrEmployee,
  isHrKarkun,
} from './hr-person-roles';
export type { HrPersonRole } from './hr-person-roles';

interface UserRef {
  _id: string;
}

const ROLE_CHECKS: Record<
  HrPersonRole,
  { matches: (person: HrPersonFlags) => boolean; notFound: string }
> = {
  karkun: { matches: isHrKarkun, notFound: 'Karkun not found.' },
  employee: { matches: isHrEmployee, notFound: 'Employee not found.' },
};

/**
 * Throws NOT_FOUND unless the person exists and is one of the role's people.
 * A person outside the role is reported as missing, not forbidden, so the
 * other side's records stay invisible.
 */
export async function assertHrPersonRole(personId: string, role: HrPersonRole) {
  const person = await People.findOneAsync(
    { _id: { $eq: personId } },
    { fields: { isKarkun: 1, isEmployee: 1, deletedAt: 1, employeeData: 1 } }
  );
  const check = ROLE_CHECKS[role];
  if (!person || person.deletedAt || !check.matches(person)) {
    throw hrError('NOT_FOUND', check.notFound);
  }
}

export interface HrEmployeeFilter {
  name?: string | null;
  cnicNumber?: string | null;
  phoneNumber?: string | null;
  bloodGroup?: string | null;
  jobId?: string | null;
  employmentStatus?: string | null;
  probationEndingWithinDays?: string | null;
  pageIndex?: string | null;
  pageSize?: string | null;
}

/** A page of the current employees of Multan, for the employees list. */
export async function searchHrEmployees(filter: HrEmployeeFilter = {}) {
  const multanCity = await findMultanCityLocation();
  if (!multanCity) return { data: [], totalResults: 0 };

  const result = (await searchPeople(
    { ...filter, cityLocationId: multanCity._id },
    { includeEmployees: true }
  )) as { data: unknown[]; totalResults: number };
  return { data: result.data, totalResults: result.totalResults };
}

/** Saves a person's general details from the role's own edit form. */
export async function updateHrPerson(
  role: HrPersonRole,
  values: { _id: string } & Record<string, unknown>,
  user: UserRef
) {
  await assertHrPersonRole(values._id, role);
  const personValues = await karkunToPerson(values);
  return updatePerson(personValues, user);
}

export async function setHrPersonImage(
  role: HrPersonRole,
  personId: string,
  imageData: string,
  user: UserRef
) {
  await assertHrPersonRole(personId, role);
  return setPersonImage(user, personId, imageData);
}

export async function addHrPersonAttachment(
  role: HrPersonRole,
  input: { _id: string; attachmentId: string },
  user: UserRef
) {
  await assertHrPersonRole(input._id, role);
  return addPersonAttachment(input, user);
}

export async function removeHrPersonAttachment(
  role: HrPersonRole,
  input: { _id: string; attachmentId: string },
  user: UserRef
) {
  await assertHrPersonRole(input._id, role);
  return removePersonAttachment(input, user);
}
