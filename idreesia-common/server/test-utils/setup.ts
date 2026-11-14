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
  client = await MongoClient.connect(inject('mongoUri'));
  db = client.db(`test_${Math.random().toString(36).slice(2)}`);
  setTestDb(db);
});

afterEach(async () => {
  await db.dropDatabase();
});

afterAll(async () => {
  setTestDb(null);
  await client.close();
});
