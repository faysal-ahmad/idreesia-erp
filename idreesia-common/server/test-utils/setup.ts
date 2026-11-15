import { type Db, MongoClient } from 'mongodb';
import { afterAll, afterEach, beforeAll, inject } from 'vitest';

import { Meteor } from './meteor-meteor';
import { setTestDb } from './meteor-mongo';

// Some modules use Meteor as a global, as Meteor apps provide.
(globalThis as { Meteor?: unknown }).Meteor = Meteor;

// One database per test file (files run in parallel), emptied after each
// test.
let client: MongoClient;
let db: Db;

beforeAll(async () => {
  // The database is named in the URI so that it is the client's default, as
  // the app's is in Meteor's.
  const uri = new URL(inject('mongoUri'));
  uri.pathname = `/test_${Math.random().toString(36).slice(2)}`;
  client = await MongoClient.connect(uri.toString());
  db = client.db();
  setTestDb(db, client);
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  setTestDb(null);
  await client.close();
});
