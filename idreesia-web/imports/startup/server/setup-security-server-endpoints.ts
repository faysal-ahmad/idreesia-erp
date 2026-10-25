import express from 'express';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import { Permissions } from 'meteor/idreesia-common/constants';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  deleteSecurityServerChannel,
  deleteSecurityServerProfile,
  setSecurityServerAlertReview,
  upsertSecurityServerAlert,
  upsertSecurityServerChannel,
  upsertSecurityServerProfile,
  SecurityServerSyncError,
  SUPPORTED_IMAGE_MIME_TYPES,
  type AlertReview,
  type SyncImage,
  type SyncUser,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

import { getUser } from './get-user';

/**
 * REST endpoints the security (face-recognition monitoring) server pushes its
 * channels, profiles and alerts to. The server logs in through POST /login as
 * a service account holding SECURITY_PUSH_SECURITY_SERVER_DATA, and sends the
 * token it gets back in the Authorization header.
 *
 * The request contract is documented in docs/security-server-push-api.md.
 */

// Profile pushes can carry several base64 enrollment images.
const BODY_SIZE_LIMIT = '15mb';
const REVIEW_VALUES: AlertReview[] = ['CORRECT', 'FALSE_POSITIVE'];

type AuthenticatedRequest = Request & { syncUser: SyncUser };
type Handler = (req: AuthenticatedRequest, res: Response) => Promise<void>;

class ValidationError extends Error {}

// ----------------------------------------------------------------------------
// Body validation helpers
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

const requireBoolean = (body: Body, field: string): boolean => {
  const value = body[field];
  if (typeof value !== 'boolean') {
    throw new ValidationError(`'${field}' must be a boolean.`);
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

const optionalNumber = (body: Body, field: string): number | null =>
  body[field] == null ? null : requireNumber(body, field);

const requireDate = (body: Body, field: string): Date => {
  const value = body[field];
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw new ValidationError(`'${field}' must be an ISO 8601 date.`);
  }
  return date;
};

const optionalDate = (body: Body, field: string): Date | null =>
  body[field] == null ? null : requireDate(body, field);

const optionalReview = (body: Body): AlertReview | null => {
  const value = body.review;
  if (value == null) return null;
  if (!REVIEW_VALUES.includes(value as AlertReview)) {
    throw new ValidationError(
      `'review' must be one of ${REVIEW_VALUES.join(', ')} or null.`
    );
  }
  return value as AlertReview;
};

// Images arrive as { mimeType, data } with base64 data. Either both are
// present or neither is.
const optionalImage = (body: Body, label: string): SyncImage | null => {
  const { mimeType, data } = body;
  if (mimeType == null && data == null) return null;

  if (typeof mimeType !== 'string' || !SUPPORTED_IMAGE_MIME_TYPES.includes(mimeType)) {
    throw new ValidationError(
      `${label}: 'mimeType' must be one of ${SUPPORTED_IMAGE_MIME_TYPES.join(', ')}.`
    );
  }
  if (typeof data !== 'string' || data === '') {
    throw new ValidationError(`${label}: 'data' must be a base64 string.`);
  }

  const buffer = Buffer.from(data, 'base64');
  if (buffer.length === 0) {
    throw new ValidationError(`${label}: 'data' is not valid base64.`);
  }
  return { mimeType, data: buffer };
};

const optionalNestedImage = (body: Body, field: string, label: string) => {
  const value = body[field];
  if (value == null) return null;
  if (typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`'${field}' must be an object.`);
  }
  return optionalImage(value as Body, label);
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
      | (SyncUser & { locked?: boolean; permissions?: string[] })
      | undefined;
    if (!user || user.locked === true) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    if (
      !hasOnePermission(user, [Permissions.SECURITY_PUSH_SECURITY_SERVER_DATA])
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
        console.error('Security server push failed', error);
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

  router.put(
    '/channels/:externalId',
    handle(async (req, res) => {
      const body = getBody(req);
      const _id = await upsertSecurityServerChannel(
        req.syncUser,
        getExternalId(req),
        {
          name: requireString(body, 'name'),
          enabled: requireBoolean(body, 'enabled'),
          similarityThreshold: optionalNumber(body, 'similarityThreshold'),
          recognitionFps: requireNumber(body, 'recognitionFps'),
        }
      );
      res.status(200).json({ _id });
    })
  );

  router.delete(
    '/channels/:externalId',
    handle(async (req, res) => {
      await deleteSecurityServerChannel(req.syncUser, getExternalId(req));
      res.status(204).end();
    })
  );

  router.put(
    '/profiles/:externalId',
    handle(async (req, res) => {
      const body = getBody(req);
      if (!Array.isArray(body.images)) {
        throw new ValidationError("'images' must be an array.");
      }

      const seenIds = new Set<string>();
      const images = body.images.map((value: unknown, index: number) => {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
          throw new ValidationError(`images[${index}] must be an object.`);
        }
        const imageBody = value as Body;
        const id = requireString(imageBody, 'id');
        if (seenIds.has(id)) {
          throw new ValidationError(`images[${index}]: duplicate id '${id}'.`);
        }
        seenIds.add(id);
        return { id, image: optionalImage(imageBody, `images[${index}]`) };
      });

      const _id = await upsertSecurityServerProfile(
        req.syncUser,
        getExternalId(req),
        {
          name: requireString(body, 'name'),
          isTest: requireBoolean(body, 'isTest'),
          createdAt: optionalDate(body, 'createdAt'),
          updatedAt: optionalDate(body, 'updatedAt'),
          images,
        }
      );
      res.status(200).json({ _id });
    })
  );

  router.delete(
    '/profiles/:externalId',
    handle(async (req, res) => {
      await deleteSecurityServerProfile(req.syncUser, getExternalId(req));
      res.status(204).end();
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
          timestamp: requireDate(body, 'timestamp'),
          similarityScore: requireNumber(body, 'similarityScore'),
          review: optionalReview(body),
          reviewedAt: optionalDate(body, 'reviewedAt'),
          image: optionalNestedImage(body, 'image', 'image'),
        }
      );
      res.status(200).json({ _id });
    })
  );

  router.patch(
    '/alerts/:externalId/review',
    handle(async (req, res) => {
      const body = getBody(req);
      await setSecurityServerAlertReview(req.syncUser, getExternalId(req), {
        review: optionalReview(body),
        reviewedAt: optionalDate(body, 'reviewedAt'),
      });
      res.status(204).end();
    })
  );

  return router;
}
