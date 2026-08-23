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

  for (const def of JOB_DEFINITIONS_REGISTRY) {
    agenda.define(def.name, def.handler);

    const existing = await JobDefinitions.findOneAsync({ name: def.name });
    if (!existing) {
      const date = new Date();
      await JobDefinitions.insertAsync({
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
      });
    }
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
