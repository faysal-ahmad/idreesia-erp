import type { GraphQLFormattedError } from 'graphql';

interface ErrorWithOriginalError {
  originalError?: unknown;
}

export const apolloErrorFormatter = (
  formattedError: GraphQLFormattedError,
  error: ErrorWithOriginalError
): GraphQLFormattedError => {
  const originalError = error.originalError;
  const errorToReport = originalError || error;

  // eslint-disable-next-line no-console
  console.log(errorToReport);
  return formattedError;
};
