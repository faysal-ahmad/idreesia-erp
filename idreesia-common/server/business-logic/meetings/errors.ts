import { GraphQLError } from 'graphql';

export type MeetingsErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_USER_INPUT'
  | 'FORBIDDEN'
  | 'TOO_LARGE'
  | 'UPLOAD_INCOMPLETE';

/**
 * Errors thrown by the meetings module. They are GraphQLErrors so an API
 * layer can pass them straight through; `extensions.code` says what went
 * wrong.
 */
export const meetingsError = (
  code: MeetingsErrorCode,
  message: string,
  details: Record<string, unknown> = {}
) => new GraphQLError(message, { extensions: { code, ...details } });
