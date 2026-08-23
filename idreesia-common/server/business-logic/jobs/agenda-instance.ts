import { Agenda } from 'agenda';
import { MongoBackend } from '@agendajs/mongo-backend';

// Agenda 6.x moved storage into separate backend packages - the connection
// string / collection name that used to be a plain `db` option on Agenda
// itself now configures the MongoBackend instead.
const agenda = new Agenda({
  backend: new MongoBackend({
    address: process.env.MONGO_URL as string,
    collection: 'agenda-jobs',
    logCollection: 'agenda-job-logs',
  }),
  processEvery: '30 seconds',
  maxConcurrency: 5,
  // Persists every job lifecycle event (start/success/fail/retry/...) to
  // agenda-job-logs via the backend's built-in logger - queried through
  // agenda.getLogs() in the pagedJobLogs resolver.
  logging: true,
});

export default agenda;
