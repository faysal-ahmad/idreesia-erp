import { describe, expect, it } from 'vitest';
import { buildSchema, parse, validate } from 'graphql';

import { createDepthLimitRule } from './depth-limit-rule';

const schema = buildSchema(`
  type Node { id: ID, child: Node }
  type Query { node: Node }
`);

const errorsFor = (source: string, maxDepth: number) =>
  validate(schema, parse(source), [createDepthLimitRule(maxDepth)]).map(
    error => error.message
  );

describe('createDepthLimitRule', () => {
  it('allows operations up to the limit', () => {
    expect(errorsFor('{ node { child { id } } }', 3)).toEqual([]);
  });

  it('rejects operations deeper than the limit', () => {
    expect(errorsFor('{ node { child { child { id } } } }', 3)).toEqual([
      'Query is nested 4 levels deep; the limit is 3.',
    ]);
  });

  it('counts fields reached through fragments', () => {
    expect(
      errorsFor(
        `
        { node { ...Deep } }
        fragment Deep on Node { child { ... on Node { child { id } } } }
      `,
        3
      )
    ).toHaveLength(1);
  });

  it('does not count introspection fields', () => {
    expect(
      errorsFor('{ __schema { types { fields { type { name } } } } }', 1)
    ).toEqual([]);
  });
});
