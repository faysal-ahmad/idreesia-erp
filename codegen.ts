import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['types/generated/schema.graphql'],
  documents: [
    'idreesia-web/{client,imports}/**/*.{ts,tsx}',
    'idreesia-mobile/{client,imports}/**/*.{ts,tsx}',
  ],
  generates: {
    'types/generated/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null',
        useIndexSignature: true,
      },
    },
    'types/generated/client-operations.ts': {
      plugins: ['typescript-operations'],
      config: {
        avoidOptionals: false,
        importSchemaTypesFrom: 'types/generated/graphql',
        maybeValue: 'T | null',
      },
    },
  },
};

export default config;
