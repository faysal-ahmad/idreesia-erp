import { GraphQLError } from 'graphql';

export type ProjectsErrorCode =
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_USER_INPUT'
  | 'FORBIDDEN';

/**
 * Errors thrown by the projects module. They are GraphQLErrors so an API layer
 * can pass them straight through; `extensions.code` says what went wrong.
 */
export const projectsError = (
  code: ProjectsErrorCode,
  message: string,
  details: Record<string, unknown> = {}
) => new GraphQLError(message, { extensions: { code, ...details } });
