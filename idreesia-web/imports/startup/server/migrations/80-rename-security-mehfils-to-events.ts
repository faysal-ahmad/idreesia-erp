import type { Db } from 'mongodb';
import { Migrations } from 'meteor/quave:migrations';

import { People } from 'meteor/idreesia-common/server/collections/common';
import { UserGroups, Users } from 'meteor/idreesia-common/server/collections/admin';

const NamespaceNotFound = 26;
const IndexNotFound = 27;

// Security "Mehfil Management" was renamed to "Event Management" (the word
// mehfil also names org locations, so it was ambiguous here). Move the data
// to the new collection, field and permission names. Safe to run again.

const COLLECTION_RENAMES: Array<[string, string]> = [
  ['security-mehfils', 'security-events'],
  ['security-mehfil-duties', 'security-event-duties'],
  ['security-mehfil-karkuns', 'security-event-karkuns'],
  ['security-mehfil-langar-details', 'security-event-langar-details'],
  ['security-mehfil-langar-dishes', 'security-event-langar-dishes'],
  ['security-mehfil-langar-locations', 'security-event-langar-locations'],
];

const PERMISSION_RENAMES: Array<[string, string]> = [
  ['security-view-mehfils', 'security-view-events'],
  ['security-manage-mehfils', 'security-manage-events'],
];

async function collectionExists(db: Db, name: string) {
  const found = await db.listCollections({ name }, { nameOnly: true }).toArray();
  return found.length > 0;
}

async function renameCollection(db: Db, from: string, to: string) {
  if (!(await collectionExists(db, from))) return;

  // An index created on the new name before this ran (e.g. by an earlier
  // migration on a fresh database) leaves an empty target behind.
  if (await collectionExists(db, to)) {
    const count = await db.collection(to).countDocuments({}, { limit: 1 });
    if (count > 0) {
      throw new Error(`Cannot rename ${from} to ${to}: ${to} already has data.`);
    }
    await db.dropCollection(to);
  }

  await db.renameCollection(from, to);
}

async function dropIndexIfExists(db: Db, collection: string, indexName: string) {
  try {
    await db.collection(collection).dropIndex(indexName);
  } catch (error) {
    const code = (error as { code?: number }).code;
    if (code !== IndexNotFound && code !== NamespaceNotFound) throw error;
  }
}

Migrations.add({
  version: 80,
  async up() {
    const db = People.rawDatabase() as unknown as Db;

    for (const [from, to] of COLLECTION_RENAMES) {
      await renameCollection(db, from, to);
    }

    await db
      .collection('security-events')
      .updateMany({ mehfilDate: { $exists: true } }, { $rename: { mehfilDate: 'eventDate' } });
    await db
      .collection('security-event-karkuns')
      .updateMany({ mehfilId: { $exists: true } }, { $rename: { mehfilId: 'eventId' } });
    await db
      .collection('security-event-langar-details')
      .updateMany({ mehfilId: { $exists: true } }, { $rename: { mehfilId: 'eventId' } });

    await dropIndexIfExists(db, 'security-event-karkuns', 'mehfilId_1');
    await db.collection('security-event-karkuns').createIndex({ eventId: 1 }, { background: true });

    // The positional `$` targets the matched array element (a permission only
    // appears once per document).
    for (const [from, to] of PERMISSION_RENAMES) {
      const selector = { permissions: from };
      const modifier = { $set: { 'permissions.$': to } };
      await Users.updateAsync(selector, modifier, { multi: true });
      await UserGroups.updateAsync(selector, modifier, { multi: true });
    }
  },
});
