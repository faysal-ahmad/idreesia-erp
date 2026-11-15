import { GraphQLError, Kind } from 'graphql';
import type {
  ASTVisitor,
  FragmentDefinitionNode,
  SelectionSetNode,
  ValidationContext,
} from 'graphql';

// The deepest operation the web and mobile apps send is 6 levels of fields;
// this leaves room for growth while stopping deeply nested queries that fan
// out into thousands of loads.
export const MAX_QUERY_DEPTH = 10;

/**
 * Depth of a selection set in fields, following fragments. Introspection
 * fields (__schema, __type, __typename) are not counted, so tooling that
 * introspects the schema still works.
 */
export const getSelectionDepth = (
  selectionSet: SelectionSetNode | undefined,
  fragments: Record<string, FragmentDefinitionNode>,
  visitedFragments: ReadonlySet<string> = new Set()
): number => {
  if (!selectionSet) return 0;
  return selectionSet.selections.reduce((max, selection) => {
    let depth = 0;
    if (selection.kind === Kind.FIELD) {
      if (selection.name.value.startsWith('__')) return max;
      depth =
        1 +
        getSelectionDepth(selection.selectionSet, fragments, visitedFragments);
    } else if (selection.kind === Kind.INLINE_FRAGMENT) {
      depth = getSelectionDepth(
        selection.selectionSet,
        fragments,
        visitedFragments
      );
    } else {
      const name = selection.name.value;
      const fragment = fragments[name];
      // A fragment that spreads itself is reported by GraphQL's own
      // NoFragmentCycles rule; just don't recurse forever here.
      if (fragment && !visitedFragments.has(name)) {
        depth = getSelectionDepth(
          fragment.selectionSet,
          fragments,
          new Set([...visitedFragments, name])
        );
      }
    }
    return Math.max(max, depth);
  }, 0);
};

/** Validation rule rejecting operations nested deeper than `maxDepth`. */
export const createDepthLimitRule =
  (maxDepth = MAX_QUERY_DEPTH) =>
  (context: ValidationContext): ASTVisitor => {
    const fragments: Record<string, FragmentDefinitionNode> = {};
    context.getDocument().definitions.forEach(definition => {
      if (definition.kind === Kind.FRAGMENT_DEFINITION) {
        fragments[definition.name.value] = definition;
      }
    });

    return {
      OperationDefinition(operation) {
        const depth = getSelectionDepth(operation.selectionSet, fragments);
        if (depth > maxDepth) {
          context.reportError(
            new GraphQLError(
              `Query is nested ${depth} levels deep; the limit is ${maxDepth}.`,
              { nodes: [operation] }
            )
          );
        }
      },
    };
  };
