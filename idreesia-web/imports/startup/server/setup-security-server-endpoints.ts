import express from 'express';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import { Permissions } from 'meteor/idreesia-common/constants';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  getSecurityServerChanges,
  getSecurityServerProfileImage,
  recordSecurityServerAlertSync,
  upsertSecurityServerAlert,
  upsertSecurityServerChannelFromSync,
  upsertSecurityServerProfileFromSync,
  SecurityServerSyncError,
  SUPPORTED_IMAGE_MIME_TYPES,
  type AlertFaceQuality,
  type ChannelSyncPush,
  type ChannelValues,
  type ProfileSyncImage,
  type ProfileSyncPush,
  type SyncImage,
  type SyncUser,
} from 'meteor/idreesia-common/server/business-logic/security/security-server';

import { getUser } from './get-user';

/**
 * REST endpoints the security (face-recognition monitoring) server syncs
 * through. Channels and profiles can be edited on either side: the server
 * pulls what changed here (/changes) and pushes what changed there
 * (/channels and /profiles by its own ids). Alerts are raised by the server
 * and pushed up. The server logs in
 * through POST /login as a service account holding
 * SECURITY_SYNC_SECURITY_SERVER_DATA, and sends the token it gets back in the
 * Authorization header.
 *
 * The contract is documented in docs/security-server-sync-api.md.
 */

// An alert push carries one base64 camera frame.
const BODY_SIZE_LIMIT = '10mb';
// A profile push carries the photos the ERP doesn't have yet.
const PROFILE_BODY_SIZE_LIMIT = '50mb';

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

const optionalString = (body: Body, field: string): string | null => {
  const value = body[field];
  if (value == null || value === '') return null;
  if (typeof value !== 'string') {
    throw new ValidationError(`'${field}' must be a string.`);
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

// Missing or null reads as null.
const optionalInteger = (
  body: Body,
  field: string,
  min: number,
  max: number
): number | null => {
  const value = body[field];
  if (value == null) return null;
  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new ValidationError(
      `'${field}' must be an integer between ${min} and ${max}, or null.`
    );
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
const parseImage = (value: unknown, field: string): SyncImage => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
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

const optionalImage = (body: Body, field: string): SyncImage | null =>
  body[field] == null ? null : parseImage(body[field], field);

// { score: 0-100, reasons: string[] }; missing or null reads as null.
const optionalFaceQuality = (
  body: Body,
  field: string
): AlertFaceQuality | null => {
  if (body[field] == null) return null;
  const quality = requireObject(body, field);
  const { score, reasons } = quality;
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new ValidationError(
      `${field}: 'score' must be a number from 0 to 100.`
    );
  }
  if (
    !Array.isArray(reasons) ||
    reasons.some(reason => typeof reason !== 'string')
  ) {
    throw new ValidationError(
      `${field}: 'reasons' must be an array of strings.`
    );
  }
  return { score, reasons };
};

const requireObject = (body: Body, field: string): Body => {
  const value = body[field];
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ValidationError(`'${field}' must be an object.`);
  }
  return value as Body;
};

const parseChannel = (body: Body): ChannelValues => {
  const similarityThreshold = body.similarityThreshold;
  if (
    similarityThreshold != null &&
    (typeof similarityThreshold !== 'number' ||
      similarityThreshold < 0 ||
      similarityThreshold > 1)
  ) {
    throw new ValidationError(
      "'similarityThreshold' must be a number between 0 and 1, or null."
    );
  }
  const connection = requireObject(body, 'connection');
  const { port } = connection;
  if (port != null && (!Number.isInteger(port) || (port as number) < 1)) {
    throw new ValidationError("'connection.port' must be a positive integer.");
  }
  return {
    name: requireString(body, 'name'),
    enabled: requireBoolean(body, 'enabled'),
    similarityThreshold: similarityThreshold as number | null,
    recognitionFps: requireNumber(body, 'recognitionFps'),
    minFaceSizePx: optionalInteger(body, 'minFaceSizePx', 0, 2000),
    minFaceQuality: optionalInteger(body, 'minFaceQuality', 0, 100),
    connection: {
      host: requireString(connection, 'host'),
      port: port as number | null,
      path: optionalString(connection, 'path'),
      username: optionalString(connection, 'username'),
      password: optionalString(connection, 'password'),
    },
  };
};

const optionalErpId = (body: Body): string | null => {
  const value = body.erpId;
  if (value == null) return null;
  if (typeof value !== 'string' || value === '') {
    throw new ValidationError("'erpId' must be a non-empty string or null.");
  }
  return value;
};

const parseChannelPush = (body: Body): ChannelSyncPush => {
  const erpId = optionalErpId(body);
  return body.deleted === true
    ? { erpId, deleted: true }
    : { erpId, deleted: false, ...parseChannel(body) };
};

const parseProfileImages = (body: Body): ProfileSyncImage[] => {
  const { images } = body;
  if (!Array.isArray(images)) {
    throw new ValidationError("'images' must be an array.");
  }
  return images.map((value, index) => {
    const field = `images[${index}]`;
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new ValidationError(`${field} must be an object.`);
    }
    const image = value as Body;
    return {
      localId: requireString(image, 'localId'),
      erpId: optionalErpId(image),
      data: image.data == null ? null : parseImage(image, field).data,
    };
  });
};

const parseProfilePush = (body: Body): ProfileSyncPush => {
  const erpId = optionalErpId(body);
  return body.deleted === true
    ? { erpId, deleted: true }
    : {
        erpId,
        deleted: false,
        name: requireString(body, 'name'),
        isTest: requireBoolean(body, 'isTest'),
        images: parseProfileImages(body),
      };
};

const getRouteParam = (req: Request, name: string): string => {
  const value = req.params[name];
  if (typeof value !== 'string' || value === '') {
    throw new ValidationError(`Missing '${name}' in the request path.`);
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

  /**
   * A profile pushed by the server, by the server's own id, with its full
   * photo set. Registered ahead of the general body parser, whose smaller
   * limit would reject it.
   */
  router.put(
    '/profiles/by-external-id/:localId',
    bodyParser.json({ limit: PROFILE_BODY_SIZE_LIMIT }),
    handleBodyParserError,
    handle(async (req, res) => {
      res
        .status(200)
        .json(
          await upsertSecurityServerProfileFromSync(
            req.syncUser,
            getRouteParam(req, 'localId'),
            parseProfilePush(getBody(req))
          )
        );
    })
  );

  router.use(bodyParser.json({ limit: BODY_SIZE_LIMIT }));
  router.use(handleBodyParserError);

  /**
   * Channels and profiles created, updated or deleted since `since`, or every
   * active one without it. Includes channel passwords.
   */
  router.get(
    '/changes',
    handle(async (req, res) => {
      const since = req.query.since;
      if (since != null && typeof since !== 'string') {
        throw new ValidationError("'since' must be given once.");
      }
      res.setHeader('Cache-Control', 'no-store');
      res
        .status(200)
        .json(
          await getSecurityServerChanges(
            since ? parseDate(since, 'since') : null
          )
        );
    })
  );

  router.put(
    '/channels/by-external-id/:localId',
    handle(async (req, res) => {
      const _id = await upsertSecurityServerChannelFromSync(
        req.syncUser,
        getRouteParam(req, 'localId'),
        parseChannelPush(getBody(req))
      );
      res.status(200).json({ _id });
    })
  );

  router.get(
    '/profiles/:profileId/images/:imageId',
    handle(async (req, res) => {
      const image = await getSecurityServerProfileImage(
        getRouteParam(req, 'profileId'),
        getRouteParam(req, 'imageId')
      );
      // An image never changes under the same id.
      res.setHeader('Cache-Control', 'private, max-age=31536000, immutable');
      res.status(200).type('image/jpeg').send(image);
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
          faceSizePx: optionalInteger(body, 'faceSizePx', 0, 100000),
          faceQuality: optionalFaceQuality(body, 'faceQuality'),
          image: optionalImage(body, 'image'),
        }
      );
      res.status(200).json({ _id });
    })
  );

  /**
   * Sent by the security server after every alert push run, even one with
   * nothing to send, so the alerts page can show when it last got through.
   */
  router.post(
    '/alerts/heartbeat',
    handle(async (req, res) => {
      await recordSecurityServerAlertSync();
      res.status(204).end();
    })
  );

  return router;
}
