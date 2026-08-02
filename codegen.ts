import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: ['idreesia-common/types/schema.graphql'],
  documents: [
    'idreesia-web/{client,imports}/**/*.{ts,tsx}',
    'idreesia-mobile/{client,imports}/**/*.{ts,tsx}',
    'idreesia-common/hooks/**/*.{ts,tsx}',
  ],
  generates: {
    'idreesia-common/types/graphql.ts': {
      plugins: ['typescript'],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null',
      },
    },
    'idreesia-common/types/resolvers.ts': {
      plugins: [
        {
          add: {
            content: "import type * as Types from './graphql';\n",
          },
        },
        'typescript-resolvers',
      ],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null',
        useIndexSignature: true,
        useTypeImports: true,
        namespacedImportName: 'Types',
      },
    },
    'idreesia-common/types/client-operations.ts': {
      plugins: [
        {
          add: {
            content: "import type * as Types from './graphql';\n",
          },
        },
        'typescript-operations',
      ],
      config: {
        avoidOptionals: false,
        maybeValue: 'T | null',
        onlyOperationTypes: true,
        namespacedImportName: 'Types',
      },
    },
  },
};

export default config;
