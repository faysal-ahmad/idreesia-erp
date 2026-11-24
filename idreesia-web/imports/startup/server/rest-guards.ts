import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { decideApiAccess } from 'meteor/idreesia-common/server/rest-api/api-access';
import {
  getReaderCommitteeChatGroupId,
  getWriterCommitteeChatGroupId,
} from 'meteor/idreesia-common/server/graphql-api/workspaces/discussions/access';

import { getUser } from './get-user';
import { sendError } from './rest-errors';

/**
 * Express middleware that protects REST routes the way the schema directives
 * protect GraphQL fields: put a guard before the handler and the handler only
 * runs for callers that passed it. Guards only call the shared access helpers
 * (decideApiAccess, the discussions access.ts); the rules live there.
 *
 * Every route must have a guard (see rest-guards-coverage.test.ts), so each
 * one is tagged with `isRestGuard`.
 */

export interface RestUser {
  _id: string;
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
  permissions?: string[];
  groups?: string[];
  chatUserId?: string | null;
}

export type RequestWithUser = Request & { user: RestUser };
export type RequestWithChatGroup = RequestWithUser & { chatGroupId: string };

export type RestGuard = RequestHandler & { isRestGuard: true };

export const isRestGuard = (handler: unknown): handler is RestGuard =>
  typeof handler === 'function' &&
  (handler as { isRestGuard?: boolean }).isRestGuard === true;

const markGuard = (handler: RequestHandler): RestGuard =>
  Object.assign(handler, { isRestGuard: true as const });

// Committee and Rocket.Chat ids are alphanumeric.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

/**
 * A valid, unlocked Meteor login token in the Authorization header - the same
 * check the GraphQL endpoint makes. Puts the user on `req.user`; 401 without.
 */
export const requireLogin = markGuard(
  Meteor.bindEnvironment(
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const user = (await getUser(req.headers.authorization)) as
          | RestUser
          | undefined;
        if (!user) {
          res.status(401).json({ error: 'Not authenticated.' });
          return;
        }
        (req as RequestWithUser).user = user;
        next();
      } catch (error) {
        sendError(req, res, error, 'rest-login');
      }
    }
  )
);

/**
 * requireLogin, and the user must also hold one of the permissions (a
 * super-admin does): 401 without a login, 403 without the permission. The same
 * rule as GraphQL's @checkPermissions.
 */
export const requirePermission = (...permissions: string[]) =>
  markGuard(
    Meteor.bindEnvironment(
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const user = (await getUser(req.headers.authorization)) as
            | RestUser
            | undefined;
          const decision = decideApiAccess(user, permissions);
          if (!decision.ok) {
            res.status(decision.status).json({ error: decision.error });
            return;
          }
          (req as RequestWithUser).user = user!;
          next();
        } catch (error) {
          sendError(req, res, error, 'rest-permission');
        }
      }
    )
  );

/**
 * For routes under /committees/:committeeId: after requireLogin, the user must
 * hold a committee role that may read (download) or write (upload) the
 * committee's discussion, and Discussions must be enabled. Puts the
 * discussion's chat group on `req.chatGroupId`. The REST counterpart of
 * @checkCommitteeAccess.
 */
export const requireCommitteeDiscussion = (mode: 'read' | 'write') =>
  markGuard(
    Meteor.bindEnvironment(
      async (req: Request, res: Response, next: NextFunction) => {
        const committeeId = String(req.params.committeeId ?? '');
        if (!ID_PATTERN.test(committeeId)) {
          res.status(400).json({ error: 'Invalid committee.' });
          return;
        }
        const { user } = req as Partial<RequestWithUser>;
        if (!user) {
          // Mounted without requireLogin ahead of it.
          res.status(401).json({ error: 'Not authenticated.' });
          return;
        }
        try {
          (req as RequestWithChatGroup).chatGroupId =
            mode === 'write'
              ? await getWriterCommitteeChatGroupId(user, committeeId)
              : await getReaderCommitteeChatGroupId(user, committeeId);
          next();
        } catch (error) {
          sendError(req, res, error, 'workspace-discussion-files');
        }
      }
    )
  );
