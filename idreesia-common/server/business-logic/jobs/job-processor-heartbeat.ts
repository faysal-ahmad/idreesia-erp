import { Mongo } from 'meteor/mongo';

// agenda.isActiveJobProcessor() is an in-memory flag on the agenda singleton,
// true only in the process that called agenda.start() - useless for
// checking processor health from a different process (e.g. the GraphQL
// server, which runs jobsEnabled=false and never starts agenda itself).
// This heartbeat is the cross-process substitute: the jobs process writes
// it periodically, any process can read it via the shared MongoDB.
const HEARTBEAT_INTERVAL_MS = 15_000;
const STALE_THRESHOLD_MS = 45_000; // 3x interval - tolerates one missed tick

interface JobProcessorHeartbeatDocument {
  _id: string;
  updatedAt: Date;
  startedAt: Date;
  pid: number;
}

const JobProcessorHeartbeat = new Mongo.Collection<JobProcessorHeartbeatDocument>(
  'job-processor-heartbeat'
);

async function beat() {
  await JobProcessorHeartbeat.updateAsync(
    { _id: 'singleton' },
    {
      $set: { updatedAt: new Date(), pid: process.pid },
      $setOnInsert: { startedAt: new Date() },
    },
    { upsert: true }
  );
}

// Call once agenda.start() has succeeded. Returns a stop function for the
// SIGTERM/SIGINT handler - going stale after STALE_THRESHOLD_MS on process
// exit is enough on its own, so stopping is a cleanliness nicety, not a
// correctness requirement.
export function startJobProcessorHeartbeat(): () => void {
  beat();
  const timer = setInterval(beat, HEARTBEAT_INTERVAL_MS);
  return () => clearInterval(timer);
}

export async function isJobProcessorAlive(): Promise<boolean> {
  const doc = await JobProcessorHeartbeat.findOneAsync({ _id: 'singleton' });
  return !!doc && Date.now() - doc.updatedAt.getTime() < STALE_THRESHOLD_MS;
}
