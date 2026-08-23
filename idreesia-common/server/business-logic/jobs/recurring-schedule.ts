import {
  JobDefinitions,
  type JobDefinitionDocument,
} from 'meteor/idreesia-common/server/collections/admin';
import agenda from './agenda-instance';

// The JobDefinitions collection - not this file - is the source of truth for
// what's actually scheduled, so a schedule edited via the Job Definitions UI
// stays in effect across restarts. agenda.every() is always called first
// (even for disabled definitions) to keep a recurring job document
// registered for every definition; disable() is what actually keeps it from
// running, and can be flipped by the UI without a restart.
//
// A definition with no schedule (manual-only - can only be triggered via
// Run Now) is skipped entirely here. Clearing an existing schedule cancels
// its recurring job immediately from the job-definition resolvers, so there
// is nothing left here for a schedule-less definition to pick back up.
export async function scheduleRecurringJobs() {
  const definitions: JobDefinitionDocument[] = await JobDefinitions.find().fetchAsync();
  for (const def of definitions) {
    if (!def.schedule) continue;

    await agenda.every(def.schedule, def.name);
    if (!def.enabled) {
      await agenda.disable({ name: def.name });
    }
  }
}
