import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const root = fileURLToPath(new URL('.', import.meta.url));
const testUtils = `${root}idreesia-common/server/test-utils`;

// Unit tests run in plain Node, outside Meteor. Code under test imports
// `meteor/...` packages, so the ones it needs are pointed at small stand-ins
// in test-utils; collections run against a real in-memory MongoDB.
export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^meteor\/idreesia-common\/(.*)$/,
        replacement: `${root}idreesia-common/$1`,
      },
      { find: 'meteor/mongo', replacement: `${testUtils}/meteor-mongo.ts` },
      { find: 'meteor/random', replacement: `${testUtils}/meteor-random.ts` },
      { find: 'sharp', replacement: `${testUtils}/stub-package.ts` },
      { find: 'meteor/meteor', replacement: `${testUtils}/meteor-meteor.ts` },
    ],
  },
  test: {
    environment: 'node',
    include: ['idreesia-common/**/*.test.ts'],
    globalSetup: [`${testUtils}/global-setup.ts`],
    setupFiles: [`${testUtils}/setup.ts`],
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
