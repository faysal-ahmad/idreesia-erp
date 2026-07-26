import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['types/generated/schema.graphql'],
  // Client operation generation is intentionally deferred until duplicate
  // operation names in feature modules are made unique.
  documents: [],
  generates: {
    'types/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null',
        useIndexSignature: true,
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
