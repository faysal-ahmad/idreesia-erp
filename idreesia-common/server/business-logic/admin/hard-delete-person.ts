import { People } from 'meteor/idreesia-common/server/collections/common';
import { runInTransaction } from 'meteor/idreesia-common/server/collections';
import { hardRemovePerson } from 'meteor/idreesia-common/server/business-logic/common/people/people-mutations';

import {
  getPersonRelationCounts,
  hasNonOwnedRelations,
} from './get-person-relation-counts';
import { removeOwnedPersonRelations } from './remove-owned-person-relations';

interface UserRef {
  _id: string;
}

/**
 * Permanently deletes a soft-deleted person, with the records they own, in
 * one transaction. A person who isn't soft deleted, or still has records
 * they don't own, is skipped. Returns 1 when the person was deleted, else 0.
 */
export async function hardDeletePerson(
  personId: string,
  user: UserRef
): Promise<number> {
  return runInTransaction(async () => {
    const person = await People.findOneAsync(
      { _id: personId, deletedAt: { $exists: true } },
      { fields: { _id: 1 } }
    );
    if (!person) return 0;

    const countsByPersonId = await getPersonRelationCounts([personId]);
    if (hasNonOwnedRelations(countsByPersonId[personId]?.counts ?? [])) {
      return 0;
    }

    await removeOwnedPersonRelations(personId);
    return hardRemovePerson(personId, user);
  });
}
