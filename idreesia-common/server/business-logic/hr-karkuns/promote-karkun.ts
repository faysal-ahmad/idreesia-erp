import { OrgLocationTypes } from 'meteor/idreesia-common/constants/organization';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { OrgLocations } from 'meteor/idreesia-common/server/collections/admin';
import { People } from 'meteor/idreesia-common/server/collections/common';
import {
  karkunToPerson,
  updatePerson,
} from 'meteor/idreesia-common/server/business-logic/common/people';

import { hrError } from '../hr-common/errors';

export interface PromoteKarkunLocation {
  /** The city the person belongs to as a karkun. */
  cityLocationId: string;
  /** Their mehfil, which must be in that city. Optional. */
  mehfilLocationId?: string | null;
}

/**
 * Makes a person (a visitor or an employee) a karkun of the given city and,
 * optionally, mehfil. Visitors have no karkun location, so it is set here.
 */
export async function promoteToKarkun(
  personId: string,
  { cityLocationId, mehfilLocationId }: PromoteKarkunLocation,
  user: { _id: string }
) {
  return runInTransaction(async () => {
    const person = await People.findOneAsync(personId);
    if (!person || person.deletedAt) {
      throw hrError('NOT_FOUND', 'Person not found.');
    }
    if (person.isKarkun) {
      throw hrError('CONFLICT', 'This person is already a karkun.');
    }

    const city = await OrgLocations.findOneAsync(cityLocationId);
    if (!city || city.type !== OrgLocationTypes.CITY) {
      throw hrError('BAD_USER_INPUT', 'Please select a city.');
    }
    if (mehfilLocationId) {
      const mehfil = await OrgLocations.findOneAsync(mehfilLocationId);
      if (
        !mehfil ||
        mehfil.type !== OrgLocationTypes.MEHFIL ||
        mehfil.parentId !== cityLocationId
      ) {
        throw hrError('BAD_USER_INPUT', 'The mehfil is not in the selected city.');
      }
    }

    const personValues = await karkunToPerson({
      _id: personId,
      cityLocationId,
      mehfilLocationId: mehfilLocationId || undefined,
    });
    // Keep the visitor city the person already has. karkunToPerson would
    // replace it with the karkun city name.
    if (person.visitorData?.city) {
      delete personValues.visitorData;
    }
    return updatePerson(personValues as Parameters<typeof updatePerson>[0], user);
  });
}
