import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';

type ApiUser = Parameters<typeof hasOnePermission>[0];

export type ApiAccessDecision =
  | { ok: true }
  | { ok: false; status: 401 | 403; error: string };

/**
 * The gate for the token-authenticated REST routers (security server,
 * correspondence): no valid (or a locked) user is 401; a user without one of the
 * permissions is 403. Same rule as GraphQL's
 * @checkPermissions.
 */
export function decideApiAccess(
  user: ApiUser,
  permissions: string[]
): ApiAccessDecision {
  if (!user || user.locked === true)
    return { ok: false, status: 401, error: 'Not authenticated.' };
  if (!hasOnePermission(user, permissions)) {
    return { ok: false, status: 403, error: 'Not authorized.' };
  }
  return { ok: true };
}
