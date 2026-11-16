import { Mongo } from './meteor-mongo';

// A stand-in for `meteor/meteor`: settings and the users collection, which is
// all the code under test reads.
export const Meteor = {
  settings: { private: {}, public: {} } as Record<string, unknown>,
  isServer: true,
  isClient: false,
  users: new Mongo.Collection('users'),
  // No fibers/async context in plain Node: nothing to bind.
  bindEnvironment: <T>(fn: T): T => fn,
};
