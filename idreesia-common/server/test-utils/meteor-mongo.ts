/* eslint-disable max-classes-per-file */
import { randomBytes } from 'node:crypto';
import type { Db, Filter } from 'mongodb';

// A stand-in for Meteor's `Mongo.Collection`, over the real MongoDB driver,
// with the (async) methods the ERP's collections and business logic use.
// Production collection classes extend it unchanged.

let currentDb: Db | null = null;

export const setTestDb = (db: Db | null) => {
  currentDb = db;
};

const getDb = (): Db => {
  if (!currentDb) throw new Error('The test database is not connected.');
  return currentDb;
};

const newId = () => randomBytes(9).toString('base64url').slice(0, 17);

const toFilter = (selector: any): Filter<any> =>
  typeof selector === 'string' ? { _id: selector } : (selector ?? {});

interface FindOptions {
  sort?: Record<string, 1 | -1>;
  limit?: number;
  skip?: number;
  fields?: Record<string, 0 | 1>;
}

class Cursor<T> {
  constructor(
    private collection: () => any,
    private selector: any,
    private options: FindOptions
  ) {}

  private build() {
    const { sort, limit, skip, fields } = this.options;
    let cursor = this.collection().find(toFilter(this.selector), {
      ...(fields ? { projection: fields } : {}),
    });
    if (sort) cursor = cursor.sort(sort);
    if (skip) cursor = cursor.skip(skip);
    if (limit) cursor = cursor.limit(limit);
    return cursor;
  }

  fetchAsync(): Promise<T[]> {
    return this.build().toArray();
  }

  countAsync(): Promise<number> {
    return this.collection().countDocuments(toFilter(this.selector));
  }
}

class Collection<T = any> {
  readonly _name: string;

  constructor(name: string, _options: unknown = {}) {
    this._name = name;
  }

  attachSchema(_schema: unknown) {
    // Schema validation is not part of what the unit tests cover.
  }

  rawCollection() {
    return getDb().collection(this._name);
  }

  async insertAsync(doc: any): Promise<string> {
    const _id = doc._id ?? newId();
    await this.rawCollection().insertOne({ ...doc, _id });
    return _id;
  }

  async findOneAsync(selector?: any, options: FindOptions = {}): Promise<T | undefined> {
    const doc = await this.rawCollection().findOne(toFilter(selector), {
      ...(options.sort ? { sort: options.sort } : {}),
      ...(options.fields ? { projection: options.fields } : {}),
    });
    return (doc as T) ?? undefined;
  }

  find(selector?: any, options: FindOptions = {}) {
    return new Cursor<T>(() => this.rawCollection(), selector, options);
  }

  /** Returns how many documents matched, like Meteor. */
  async updateAsync(
    selector: any,
    modifier: any,
    options: { multi?: boolean; upsert?: boolean } = {}
  ): Promise<number> {
    const raw = this.rawCollection();
    const result = options.multi
      ? await raw.updateMany(toFilter(selector), modifier, { upsert: options.upsert })
      : await raw.updateOne(toFilter(selector), modifier, { upsert: options.upsert });
    return result.matchedCount;
  }

  async removeAsync(selector: any): Promise<number> {
    const result = await this.rawCollection().deleteMany(toFilter(selector));
    return result.deletedCount;
  }
}

export const Mongo = { Collection };
