declare module 'graphql-tag' {
  import type { DocumentNode } from 'graphql';

  export default function gql(
    literals: TemplateStringsArray,
    ...placeholders: unknown[]
  ): DocumentNode;
}
