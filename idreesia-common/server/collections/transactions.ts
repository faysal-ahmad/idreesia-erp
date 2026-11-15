import { AsyncLocalStorage } from 'node:async_hooks';

import { MongoInternals } from 'meteor/mongo';
import type { ClientSession, MongoClient, TransactionOptions } from 'mongodb';

/**
 * MongoDB transactions for business operations that write more than one
 * document or collection.
 *
 * Meteor's collection methods can't be given a session, so the transaction is
 * ambient. `runInTransaction` keeps its session in AsyncLocalStorage, and
 * every driver call made while it runs (Meteor's `insertAsync`, `updateAsync`,
 * `removeAsync`, `findOneAsync`, `find`, `countAsync`, as well as direct
 * `rawCollection()` calls and `aggregate`) uses that session. Collection2
 * validation, transforms and id generation still run as usual.
 */

type Callback = () => unknown | Promise<unknown>;

interface TransactionContext {
  client: MongoClient;
  session: ClientSession;
  afterCommit: Callback[];
  onRollback: Callback[];
}

const storage = new AsyncLocalStorage<TransactionContext>();

const TRANSACTION_OPTIONS: TransactionOptions = {
  readConcern: { level: 'snapshot' },
  writeConcern: { w: 'majority' },
  readPreference: 'primary',
};

// Driver collection methods that take an options object, and the position of
// that object in their arguments.
const OPTIONS_ARG_INDEX: Record<string, number> = {
  find: 1,
  findOne: 1,
  aggregate: 1,
  countDocuments: 1,
  distinct: 2,
  insertOne: 1,
  insertMany: 1,
  bulkWrite: 1,
  updateOne: 2,
  updateMany: 2,
  replaceOne: 2,
  deleteOne: 1,
  deleteMany: 1,
  findOneAndUpdate: 2,
  findOneAndReplace: 2,
  findOneAndDelete: 1,
};

const getClient = (): MongoClient =>
  MongoInternals.defaultRemoteCollectionDriver().mongo.client;

const patchedPrototypes = new WeakSet<object>();

/**
 * Makes the driver's collection methods use the ambient session. Meteor
 * passes a session of its own on writes; inside a transaction it is replaced.
 * Collections of other clients (e.g. Agenda's) are left alone.
 */
function injectAmbientSession(client: MongoClient) {
  const proto = Object.getPrototypeOf(client.db().collection('transactions'));
  if (patchedPrototypes.has(proto)) return;
  patchedPrototypes.add(proto);

  Object.entries(OPTIONS_ARG_INDEX).forEach(([name, index]) => {
    const original = proto[name];
    if (typeof original !== 'function') return;
    proto[name] = function withAmbientSession(
      this: { client?: MongoClient },
      ...args: unknown[]
    ) {
      const context = storage.getStore();
      if (!context || this.client !== context.client) {
        return original.apply(this, args);
      }
      const options = (args[index] ?? {}) as Record<string, unknown>;
      const withSession = Array.from(
        { length: Math.max(args.length, index + 1) },
        (_, i) => (i === index ? { ...options, session: context.session } : args[i])
      );
      return original.apply(this, withSession);
    };
  });
}

/** Whether the caller is running inside `runInTransaction`. */
export const isInTransaction = (): boolean => !!storage.getStore();

/**
 * Runs `fn` in a MongoDB transaction: either all of its writes are committed
 * or none are. A call made while a transaction is already running joins it.
 *
 * `fn` may be run more than once (the driver retries transient errors), so
 * effects outside the database belong in `afterCommit`, or before the
 * transaction. Inside `fn`:
 * - don't catch a database error and carry on; the transaction is already
 *   aborted
 * - don't create indexes
 */
export async function runInTransaction<T>(fn: () => Promise<T>): Promise<T> {
  if (storage.getStore()) return fn();

  const client = getClient();
  injectAmbientSession(client);

  const session = client.startSession();
  let result: T;
  // One context per attempt: the driver re-runs `fn` on transient errors.
  const attempts: TransactionContext[] = [];
  let committed = false;
  try {
    await session.withTransaction(async () => {
      const context: TransactionContext = {
        client,
        session,
        afterCommit: [],
        onRollback: [],
      };
      attempts.push(context);
      await storage.run(context, async () => {
        // Starts the transaction on the server before `fn` runs, so that
        // operations `fn` runs concurrently all find it already started.
        await client
          .db()
          .collection('transactions')
          .findOne({}, { session, projection: { _id: 1 } });
        result = await fn();
      });
    }, TRANSACTION_OPTIONS);
    committed = true;
  } finally {
    await session.endSession();
    // Every attempt but a committed last one was rolled back.
    const rolledBack = committed ? attempts.slice(0, -1) : attempts;
    await runQuietly(
      rolledBack.flatMap(attempt => attempt.onRollback),
      'Rollback'
    );
  }

  await runQuietly(attempts[attempts.length - 1].afterCommit, 'After-commit');
  return result!;
}

async function runQuietly(callbacks: Callback[], what: string) {
  for (const callback of callbacks) {
    try {
      await callback();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[transactions] ${what} step failed`, error);
    }
  }
}

/**
 * Runs `fn` once the current transaction commits, and never if it rolls back.
 * For effects that can't be rolled back: notifications, chat, file deletes.
 * Errors are logged, not thrown, since the change is already committed.
 * Outside a transaction `fn` runs straight away and its errors are thrown.
 */
export async function afterCommit(fn: Callback): Promise<void> {
  const context = storage.getStore();
  if (context) {
    context.afterCommit.push(fn);
    return;
  }
  await fn();
}

/**
 * Runs `fn` if the current transaction rolls back, to undo an effect outside
 * the database made inside it, e.g. deleting a file stored for a record that
 * is never committed. Errors are logged, not thrown. Outside a transaction
 * there is nothing to roll back and `fn` never runs, so callers that may run
 * outside one must clean up themselves.
 */
export async function onRollback(fn: Callback): Promise<void> {
  storage.getStore()?.onRollback.push(fn);
}
