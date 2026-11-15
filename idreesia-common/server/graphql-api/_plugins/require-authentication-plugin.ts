import { GraphQLError, Kind } from 'graphql';
import type {
  DocumentNode,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  SelectionSetNode,
} from 'graphql';
import type { ApolloServerPlugin } from '@apollo/server';

// Root Query/Mutation fields an anonymous caller may use. Everything else on
// /graphql needs a valid login token. `currentUser` returns null when logged
// out (the clients use it to decide whether to show the login screen) and
// `registerUser` is the self-registration form on the login screen.
export const ANONYMOUS_ROOT_FIELDS: ReadonlySet<string> = new Set([
  '__typename',
  'currentUser',
  'registerUser',
]);

// Names of the root fields an operation selects, following inline fragments
// and fragment spreads at the root. @skip/@include are ignored, so a field is
// counted even if a variable would skip it.
export const getRootFieldNames = (
  document: DocumentNode,
  operation: OperationDefinitionNode
): Set<string> => {
  const fragments = new Map<string, FragmentDefinitionNode>();
  document.definitions.forEach(definition => {
    if (definition.kind === Kind.FRAGMENT_DEFINITION) {
      fragments.set(definition.name.value, definition);
    }
  });

  const names = new Set<string>();
  const visitedFragments = new Set<string>();
  const collect = (selectionSet: SelectionSetNode) => {
    selectionSet.selections.forEach(selection => {
      if (selection.kind === Kind.FIELD) {
        names.add(selection.name.value);
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        collect(selection.selectionSet);
      } else {
        const fragmentName = selection.name.value;
        if (visitedFragments.has(fragmentName)) return;
        visitedFragments.add(fragmentName);
        const fragment = fragments.get(fragmentName);
        if (fragment) collect(fragment.selectionSet);
      }
    });
  };
  collect(operation.selectionSet);

  return names;
};

export const isAllowedAnonymously = (
  document: DocumentNode,
  operation: OperationDefinitionNode
): boolean =>
  [...getRootFieldNames(document, operation)].every(name =>
    ANONYMOUS_ROOT_FIELDS.has(name)
  );

interface AuthContext {
  user?: unknown;
}

// Rejects operations from callers without a valid login token unless every
// root field is in ANONYMOUS_ROOT_FIELDS, so a field that forgets its
// @checkPermissions directive or in-resolver check is still closed to the
// public. Runs after parsing and validation, before any resolver.
//
// The response stays HTTP 200 with an UNAUTHENTICATED error: the web client's
// error link treats that as a GraphQL error rather than a network failure, and
// the server's New Relic reporting already ignores the code.
export const RequireAuthenticationPlugin = (): ApolloServerPlugin<AuthContext> => ({
  async requestDidStart() {
    return {
      async didResolveOperation({ contextValue, document, operation }) {
        if (contextValue.user) return;
        if (operation && isAllowedAnonymously(document, operation)) return;

        throw new GraphQLError('You must be logged in to perform this operation.', {
          extensions: { code: 'UNAUTHENTICATED', http: { status: 200 } },
        });
      },
    };
  },
});
