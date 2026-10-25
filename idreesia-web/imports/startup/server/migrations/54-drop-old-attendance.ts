import { Migrations } from 'meteor/quave:migrations';

import { DutyDayAttendances } from 'meteor/idreesia-common/server/collections/hr';

const NamespaceNotFound = 26;

async function dropIfExists(db: { dropCollection(name: string): Promise<unknown> | void }, name: string) {
  try {
    await db.dropCollection(name);
  } catch (error) {
    if ((error as { code?: number }).code !== NamespaceNotFound) throw error;
  }
}

// Monthly attendance records and karkun duties are replaced by duty planning
// (teams, assignments and day attendance records). The old
// create-monthly-attendance job definition and its scheduled runs are removed
// at startup by setupJobDefinitions, since it's no longer in the registry.
Migrations.add({
  version: 54,
  async up() {
    const db = DutyDayAttendances.rawDatabase();

    await dropIfExists(db, 'hr-attendances');
    await dropIfExists(db, 'hr-karkun-duties');
  },
});
