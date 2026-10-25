import express from 'express';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import { Permissions } from 'meteor/idreesia-common/constants';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  getSecurityServerAlertReviews,
  getSecurityServerConfig,
  getSecurityServerConfigVersion,
  upsertSecurityServerAlert,
  SecurityServerSyncError,
  SUPPORTED_IMAGE_MIME_TYPES,
  type SyncImage,
  type SyncUser,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

import { getUser } from './get-user';

/**
 * REST endpoints the security (face-recognition monitoring) server syncs
 * through. Channels and profiles are managed in the ERP and pulled down by the
 * server; alerts are raised by the server and pushed up. The server logs in
 * through POST /login as a service account holding
 * SECURITY_SYNC_SECURITY_SERVER_DATA, and sends the token it gets back in the
 * Authorization header.
 *
 * The contract is documented in docs/security-server-sync-api.md.
 */

// An alert push carries one base64 camera frame.
const BODY_SIZE_LIMIT = '10mb';

type AuthenticatedRequest = Request & { syncUser: SyncUser };
type Handler = (req: AuthenticatedRequest, res: Response) => Promise<void>;

class ValidationError extends Error {}

// ----------------------------------------------------------------------------
// Request validation helpers
// ----------------------------------------------------------------------------

type Body = Record<string, unknown>;

const getBody = (req: Request): Body => {
  const { body } = req;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('Request body must be a JSON object.');
  }
  return body as Body;
};

const requireString = (body: Body, field: string): string => {
  const value = body[field];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new ValidationError(`'${field}' must be a non-empty string.`);
  }
  return value;
};

const requireNumber = (body: Body, field: string): number => {
  const value = body[field];
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new ValidationError(`'${field}' must be a number.`);
  }
  return value;
};

const parseDate = (value: unknown, field: string): Date => {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw new ValidationError(`'${field}' must be an ISO 8601 date.`);
  }
  return date;
};

// Images arrive as { mimeType, data } with base64 data.
const optionalImage = (body: Body, field: string): SyncImage | null => {
  const value = body[field];
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`'${field}' must be an object.`);
  }

  const { mimeType, data } = value as Body;
  if (
    typeof mimeType !== 'string' ||
    !SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType)
  ) {
    throw new ValidationError(
      `${field}: 'mimeType' must be one of ${SUPPORTED_IMAGE_MIME_TYPES.join(', ')}.`
    );
  }
  if (typeof data !== 'string' || data === '') {
    throw new ValidationError(`${field}: 'data' must be a base64 string.`);
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length === 0) {
    throw new ValidationError(`${field}: 'data' is not valid base64.`);
  }
  return { mimeType, data: buffer };
};

const getQueryString = (req: Request, name: string): string | null => {
  const value = req.query[name];
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    throw new ValidationError(`'${name}' must be given once.`);
  }
  return value;
};

const getExternalId = (req: Request): string => {
  const { externalId } = req.params;
  if (typeof externalId !== 'string' || externalId === '') {
    throw new ValidationError('Missing external id in the request path.');
  }
  return externalId;
};

// ----------------------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------------------

const authenticate = Meteor.bindEnvironment(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (await getUser(req.headers.authorization)) as
      (SyncUser & { locked?: boolean; permissions?: string[] }) | undefined;
    if (!user || user.locked === true) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    if (
      !hasOnePermission(user, [Permissions.SECURITY_SYNC_SECURITY_SERVER_DATA])
    ) {
      res.status(403).json({ error: 'Not authorized.' });
      return;
    }

    (req as AuthenticatedRequest).syncUser = { _id: user._id };
    next();
  }
);

// Body-parser failures (malformed JSON, body too large) would otherwise get
// express's default HTML error page.
const handleBodyParserError = (
  error: Error & { status?: number },
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!error) {
    next();
    return;
  }
  res.status(error.status ?? 400).json({ error: error.message });
};

const handle = (handler: Handler) =>
  Meteor.bindEnvironment(async (req: Request, res: Response) => {
    try {
      await handler(req as AuthenticatedRequest, res);
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({ error: error.message });
      } else if (error instanceof SecurityServerSyncError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        // eslint-disable-next-line no-console
        console.error('Security server sync failed', error);
        res.status(500).json({ error: 'Internal server error.' });
      }
    }
  });

// ----------------------------------------------------------------------------
// Routes
// ----------------------------------------------------------------------------

export function createSecurityServerRouter() {
  const router = express.Router();
  router.use(authenticate);
  router.use(bodyParser.json({ limit: BODY_SIZE_LIMIT }));
  router.use(handleBodyParserError);

  /**
   * Full snapshot of active channels and profiles. Cheap to poll: answers 304
   * when the caller's If-None-Match still matches the current version.
   */
  router.get(
    '/config',
    handle(async (req, res) => {
      const etag = `"${await getSecurityServerConfigVersion()}"`;
      // The snapshot carries RTSP passwords and presigned image URLs.
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('ETag', etag);
      if (req.headers['if-none-match'] === etag) {
        res.status(304).end();
        return;
      }
      res.status(200).json(await getSecurityServerConfig());
    })
  );

  router.put(
    '/alerts/:externalId',
    handle(async (req, res) => {
      const body = getBody(req);
      const _id = await upsertSecurityServerAlert(
        req.syncUser,
        getExternalId(req),
        {
          profileId: requireString(body, 'profileId'),
          channelId: requireString(body, 'channelId'),
          timestamp: parseDate(body.timestamp, 'timestamp'),
          similarityScore: requireNumber(body, 'similarityScore'),
          image: optionalImage(body, 'image'),
        }
      );
      res.status(200).json({ _id });
    })
  );

  router.get(
    '/alert-reviews',
    handle(async (req, res) => {
      const since = getQueryString(req, 'since');
      const limit = getQueryString(req, 'limit');
      const nLimit = limit == null ? null : Number.parseInt(limit, 10);
      if (nLimit != null && (Number.isNaN(nLimit) || nLimit < 1)) {
        throw new ValidationError("'limit' must be a positive integer.");
      }

      res
        .status(200)
        .json(
          await getSecurityServerAlertReviews(
            since == null ? null : parseDate(since, 'since'),
            nLimit
          )
        );
    })
  );

  return router;
}
