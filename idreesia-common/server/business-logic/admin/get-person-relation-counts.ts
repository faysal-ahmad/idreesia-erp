import { Mongo } from 'meteor/mongo';
import { Attendances, KarkunDuties, Salaries } from 'meteor/idreesia-common/server/collections/hr';
import { MehfilKarkuns, VisitorStays } from 'meteor/idreesia-common/server/collections/security';
import { ImdadRequests } from 'meteor/idreesia-common/server/collections/imdad';
import { Messages } from 'meteor/idreesia-common/server/collections/communication';
import {
  IssuanceForms,
  PurchaseForms,
  StockAdjustments,
} from 'meteor/idreesia-common/server/collections/inventory';
import { Users } from 'meteor/idreesia-common/server/collections/admin';
import { AuditLogs } from 'meteor/idreesia-common/server/collections/common';

export interface PersonRelationCount {
  name: string;
  count: number;
}

export interface PersonRelationCounts {
  counts: PersonRelationCount[];
  total: number;
}

// Relations that are not owned by the person - a person can only be hard
// deleted once none of these have a non-zero count. User Account blocks
// deletion too: createdBy/updatedBy/deletedBy fields across the app store
// the linked Users._id (not the person's own _id), so a hard delete has no
// way to find and clean up every place that id is referenced. Removing the
// person while they still have a user account would leave those orphaned.
export const NOT_OWNED_RELATION_NAMES = new Set([
  'Salary Records',
  'Issuance Forms',
  'Purchase Forms',
  'Stock Adjustments',
  'User Account',
]);

export function hasNonOwnedRelations(counts: PersonRelationCount[]): boolean {
  return counts.some(
    category => NOT_OWNED_RELATION_NAMES.has(category.name) && category.count > 0
  );
}

function emptyCountsById(personIds: string[]): Record<string, number> {
  const result: Record<string, number> = {};
  personIds.forEach(personId => {
    result[personId] = 0;
  });
  return result;
}

async function countBySingleField(
  collection: Mongo.Collection<any>,
  field: string,
  personIds: string[]
): Promise<Record<string, number>> {
  const counts = emptyCountsById(personIds);
  const rows = await collection
    .find({ [field]: { $in: personIds } }, { fields: { [field]: 1 } })
    .fetchAsync();

  rows.forEach((row: Record<string, unknown>) => {
    const value = row[field] as string | undefined;
    if (value && value in counts) {
      counts[value] += 1;
    }
  });

  return counts;
}

async function countByAnyField(
  collection: Mongo.Collection<any>,
  fields: string[],
  personIds: string[]
): Promise<Record<string, number>> {
  const counts = emptyCountsById(personIds);
  const rows = await collection
    .find(
      { $or: fields.map(field => ({ [field]: { $in: personIds } })) },
      { fields: Object.fromEntries(fields.map(field => [field, 1])) }
    )
    .fetchAsync();

  rows.forEach((row: Record<string, unknown>) => {
    const matchedIds = new Set<string>();
    fields.forEach(field => {
      const value = row[field];
      if (Array.isArray(value)) {
        value.forEach(v => {
          if (typeof v === 'string' && v in counts) matchedIds.add(v);
        });
      } else if (typeof value === 'string' && value in counts) {
        matchedIds.add(value);
      }
    });

    matchedIds.forEach(personId => {
      counts[personId] += 1;
    });
  });

  return counts;
}

export async function getPersonRelationCounts(
  personIds: string[]
): Promise<Record<string, PersonRelationCounts>> {
  const [
    attendanceCounts,
    salaryCounts,
    karkunDutyCounts,
    visitorStayCounts,
    mehfilKarkunCounts,
    imdadRequestCounts,
    messageCounts,
    issuanceFormCounts,
    purchaseFormCounts,
    stockAdjustmentCounts,
    userAccountCounts,
    auditLogCounts,
  ] = await Promise.all([
    countBySingleField(Attendances, 'karkunId', personIds),
    countBySingleField(Salaries, 'karkunId', personIds),
    countBySingleField(KarkunDuties, 'karkunId', personIds),
    countBySingleField(VisitorStays, 'visitorId', personIds),
    countBySingleField(MehfilKarkuns, 'karkunId', personIds),
    countBySingleField(ImdadRequests, 'visitorId', personIds),
    countByAnyField(Messages, ['karkunIds', 'visitorIds'], personIds),
    countByAnyField(IssuanceForms, ['issuedBy', 'issuedTo'], personIds),
    countByAnyField(PurchaseForms, ['receivedBy', 'purchasedBy'], personIds),
    countBySingleField(StockAdjustments, 'adjustedBy', personIds),
    countBySingleField(Users, 'personId', personIds),
    countBySingleField(AuditLogs, 'entityId', personIds),
  ]);

  const categories: { name: string; countsById: Record<string, number> }[] = [
    { name: 'Attendance Records', countsById: attendanceCounts },
    { name: 'Salary Records', countsById: salaryCounts },
    { name: 'Duty Assignments', countsById: karkunDutyCounts },
    { name: 'Stay History', countsById: visitorStayCounts },
    { name: 'Mehfil Assignments', countsById: mehfilKarkunCounts },
    { name: 'Imdad Requests', countsById: imdadRequestCounts },
    { name: 'Messages', countsById: messageCounts },
    { name: 'Issuance Forms', countsById: issuanceFormCounts },
    { name: 'Purchase Forms', countsById: purchaseFormCounts },
    { name: 'Stock Adjustments', countsById: stockAdjustmentCounts },
    { name: 'User Account', countsById: userAccountCounts },
    { name: 'Audit Logs', countsById: auditLogCounts },
  ];

  const result: Record<string, PersonRelationCounts> = {};
  personIds.forEach(personId => {
    const counts = categories.map(category => ({
      name: category.name,
      count: category.countsById[personId] ?? 0,
    }));

    result[personId] = {
      counts,
      total: counts.reduce((sum, category) => sum + category.count, 0),
    };
  });

  return result;
}
