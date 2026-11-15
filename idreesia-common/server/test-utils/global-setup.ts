import { MongoMemoryReplSet } from 'mongodb-memory-server';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    mongoUri: string;
  }
}

/**
 * Starts one in-memory MongoDB for the whole run: a one-node replica set,
 * since transactions need one.
 */
export default async function setup(project: TestProject) {
  const server = await MongoMemoryReplSet.create({
    replSet: { count: 1, storageEngine: 'wiredTiger' },
  });
  project.provide('mongoUri', server.getUri());
  return async () => {
    await server.stop();
  };
}
