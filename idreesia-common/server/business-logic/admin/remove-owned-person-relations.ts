import { DutyDayAttendances, Teams } from 'meteor/idreesia-common/server/collections/hr';
import { removePersonFromCommittees } from 'meteor/idreesia-common/server/business-logic/hr/committee';
import { MehfilKarkuns, VisitorStays } from 'meteor/idreesia-common/server/collections/security';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';

// Removes the relation records owned by a person (the categories a person
// can still have when they are hard deleted, since ownership of these is
// tied entirely to that person). Non-owned relations (Salary Records,
// Issuance Forms, Purchase Forms, Stock Adjustments, User Account) are never
// touched here - hard delete is only allowed once those are already at zero.
// User Account in particular is never cleaned up automatically: the linked
// Users._id is what createdBy/updatedBy/deletedBy fields store all over the
// app, and a hard delete has no way to find every place it's referenced, so
// the account must be removed/unlinked separately before the person can go.
//
// This clears the person's prior Audit Logs too. People.hardRemovePerson
// writes one more Audit Log entry for the delete operation itself after this
// runs, so that final record is unaffected by this cleanup.
export async function removeOwnedPersonRelations(personId: string): Promise<void> {
  await Promise.all([
    removePersonFromCommittees(personId),
    Teams.updateAsync(
      { 'members.karkunId': personId },
      { $pull: { members: { karkunId: personId } } },
      { multi: true }
    ),
    DutyDayAttendances.updateAsync(
      { 'karkuns.karkunId': personId },
      { $pull: { karkuns: { karkunId: personId } } },
      { multi: true }
    ),
    VisitorStays.removeAsync({ visitorId: personId }),
    MehfilKarkuns.removeAsync({ karkunId: personId }),
    AuditLogs.removeAsync({ entityId: personId }),
  ]);
}
