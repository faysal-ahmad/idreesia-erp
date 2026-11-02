import type { GraphQLFormattedError } from 'graphql';

import { isIgnoredErrorCode, noticeError } from './newrelic';

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

  if (!isIgnoredErrorCode(formattedError.extensions?.code)) {
    noticeError(errorToReport, {
      source: 'graphql',
      path: formattedError.path?.join('.') ?? '',
    });
  }
  return formattedError;
};
