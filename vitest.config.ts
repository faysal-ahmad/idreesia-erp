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
      {
        find: 'meteor/accounts-base',
        replacement: `${testUtils}/stub-package.ts`,
      },
      { find: 'meteor/meteor', replacement: `${testUtils}/meteor-meteor.ts` },
    ],
  },
  test: {
    environment: 'node',
    include: [
      'idreesia-common/**/*.test.ts',
      // Security-relevant server startup code that has no Meteor dependency
      // beyond the stand-ins above.
      'idreesia-web/imports/startup/server/**/*.test.ts',
    ],
    globalSetup: [`${testUtils}/global-setup.ts`],
    setupFiles: [`${testUtils}/setup.ts`],
    // graphql-tools must load the same copy of `graphql` as the tests do, or
    // building a directive-wrapped schema fails with "another module or realm".
    server: { deps: { inline: [/@graphql-tools\//] } },
    // Report only (no thresholds): `yarn test:unit:coverage`.
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      reportsDirectory: 'coverage',
      include: [
        'idreesia-common/server/**/*.ts',
        'idreesia-web/imports/startup/server/**/*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/test-utils/**',
        '**/schemas/**',
        '**/collections/**',
        '**/generated/**',
      ],
    },
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
