import {
  JobDefinitions,
  type JobDefinitionDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import agenda from './agenda-instance';
import JOB_DEFINITIONS_REGISTRY from './job-definitions-registry';

// Seeds JobDefinitions from the registry (insert-only-if-missing - never an
// upsert, so a schedule edited via the Job Definitions UI survives across
// restarts instead of being reverted to defaultSchedule on every deploy),
// then removes any leftover definition whose name is no longer in the
// registry, along with every scheduled/queued/repeating instance of it -
// once the code-side definition is gone there's no handler left to run it.
export async function setupJobDefinitions() {
  const registryNames = new Set(JOB_DEFINITIONS_REGISTRY.map(def => def.name));

  // Enforces at the database level what the upsert below relies on: without
  // a unique index, two processes racing an upsert on a non-_id filter can
  // each decide "no match" and both insert - createIndex is a no-op once the
  // index already exists, so safe to call on every boot.
  await JobDefinitions.rawCollection().createIndex({ name: 1 }, { unique: true });

  for (const def of JOB_DEFINITIONS_REGISTRY) {
    agenda.define(def.name, def.handler);

    // Atomic upsert (not read-then-insert) - the web and jobs pm2 processes
    // both call setupJobDefinitions() on boot. bypassCollection2 is required
    // here: collection2's updateAsync refuses a non-_id selector ("ID is
    // required in job-definitions updateAsync"), so schema validation is
    // skipped for this internal seed write - every field below is already
    // set explicitly, matching what the schema would otherwise fill in.
    const date = new Date();
    await JobDefinitions.updateAsync(
      { name: def.name },
      {
        $setOnInsert: {
          name: def.name,
          displayName: def.displayName,
          // Omitted (not null) for a manual-only job, matching the optional
          // schema fields - see JobDefinitionDocument.
          ...(def.defaultSchedule
            ? { defaultSchedule: def.defaultSchedule, schedule: def.defaultSchedule }
            : {}),
          enabled: true,
          createdAt: date,
          updatedAt: date,
        },
      },
      { upsert: true, bypassCollection2: true }
    );
  }

  const existingDefs: JobDefinitionDocument[] = await JobDefinitions.find().fetchAsync();
  const orphanedDefs = existingDefs.filter(
    (def: JobDefinitionDocument) => !registryNames.has(def.name)
  );
  for (const def of orphanedDefs) {
    await agenda.cancel({ name: def.name });
    await JobDefinitions.removeAsync({ _id: def._id });
  }
}
