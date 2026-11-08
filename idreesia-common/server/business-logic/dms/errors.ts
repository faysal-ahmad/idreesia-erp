import { GraphQLError } from 'graphql';

export type DmsErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'LOCKED'
  | 'BAD_USER_INPUT'
  | 'FORBIDDEN'
  | 'TOO_LARGE'
  | 'UPLOAD_INCOMPLETE';

/**
 * Errors thrown by the DMS. They are GraphQLErrors so a future API layer
 * can pass them straight through; `extensions.code` says what went wrong.
 */
export const dmsError = (
  code: DmsErrorCode,
  message: string,
  details: Record<string, unknown> = {}
) => new GraphQLError(message, { extensions: { code, ...details } });

export const isDuplicateKeyError = (error: unknown) => {
  const { code, message } = (error ?? {}) as {
    code?: number;
    message?: string;
  };
  return code === 11000 || /E11000/.test(message ?? '');
};
