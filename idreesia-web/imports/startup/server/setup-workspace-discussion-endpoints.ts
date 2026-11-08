import cors from 'cors';
import express from 'express';
import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';
import { GraphQLError } from 'graphql';

import {
  fetchDiscussionFile,
  uploadDiscussionFile,
  MAX_DISCUSSION_FILE_SIZE,
} from 'meteor/idreesia-common/server/business-logic/discussions';
import { getMemberCommitteeChatGroupId } from 'meteor/idreesia-common/server/graphql-api/workspaces/discussions/access';

import { getUser } from './get-user';
import { noticeError } from './newrelic';

/**
 * File routes for committee discussions in the Workspaces module. Files live
 * in Rocket.Chat, which the browser can't reach, so they go through here
 * with the Meteor login token in the Authorization header.
 *
 * Like the GraphQL resolvers, these routes only check access (committee
 * membership + Discussions enabled); the discussions business logic does
 * the rest.
 */

interface RequestWithUser extends Request {
  erpUser?: { _id: string; chatUserId?: string | null };
}

// Committee and Rocket.Chat file ids are alphanumeric.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const STATUS_BY_CODE: Record<string, number> = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_USER_INPUT: 400,
  PAYLOAD_TOO_LARGE: 413,
  DISCUSSION_FAILED: 502,
};

const sendError = (req: Request, res: Response, error: unknown) => {
  if (error instanceof GraphQLError) {
    const code = String(error.extensions?.code ?? '');
    const status = STATUS_BY_CODE[code] ?? 500;
    if (status >= 500) {
      noticeError(error, { source: 'workspace-discussion-files', path: req.path });
    }
    res.status(status).json({ error: error.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error('Workspace discussion files failed', error);
  noticeError(error, { source: 'workspace-discussion-files', path: req.path });
  res.status(500).json({ error: 'Something went wrong.' });
};

const authenticate = Meteor.bindEnvironment(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = (await getUser(req.headers.authorization)) as
      | RequestWithUser['erpUser']
      | undefined;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    req.erpUser = user;
    next();
  }
);

// Resolves the committee's chat group after checking the user may take part.
const authorize = async (req: RequestWithUser) => {
  const committeeId = String(req.params.committeeId ?? '');
  if (!ID_PATTERN.test(committeeId)) {
    throw new GraphQLError('Invalid committee.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
  return getMemberCommitteeChatGroupId(req.erpUser, committeeId);
};

const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'last-modified'];

const streamFile = Meteor.bindEnvironment(
  async (req: RequestWithUser, res: Response) => {
    const fileId = String(req.params.fileId ?? '');
    const fileName = String(req.params.fileName ?? '');
    const signature = String(req.query.sig ?? '');
    if (!ID_PATTERN.test(fileId) || !fileName) {
      res.status(400).json({ error: 'Invalid file path.' });
      return;
    }

    try {
      const chatGroupId = await authorize(req);
      const upstream = await fetchDiscussionFile(chatGroupId, {
        fileId,
        fileName,
        signature,
      });
      PASSTHROUGH_HEADERS.forEach(header => {
        const value = upstream.headers.get(header);
        if (value) res.setHeader(header, value);
      });
      res.setHeader('Cache-Control', 'private, max-age=86400');
      res.setHeader(
        'Content-Disposition',
        `inline; filename*=UTF-8''${encodeURIComponent(fileName)}`
      );

      if (!upstream.body) {
        res.end();
        return;
      }
      // Stream rather than buffer - audio/video uploads can be large.
      const reader = upstream.body.getReader();
      res.on('close', () => {
        reader.cancel().catch(() => {});
      });
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error) {
      if (res.headersSent) {
        res.destroy();
        return;
      }
      sendError(req, res, error);
    }
  }
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_DISCUSSION_FILE_SIZE, files: 1 },
});

const receiveFile = (req: Request, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, error => {
    if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({ error: 'Files can be at most 25 MB.' });
      return;
    }
    if (error) {
      res.status(400).json({ error: 'Could not read the uploaded file.' });
      return;
    }
    next();
  });
};

const uploadFile = Meteor.bindEnvironment(
  async (req: RequestWithUser, res: Response) => {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({ error: 'No file was uploaded.' });
      return;
    }

    try {
      const chatGroupId = await authorize(req);
      // Optional: posts the file as a reply in that thread.
      const threadId =
        typeof req.body?.threadId === 'string' && req.body.threadId
          ? req.body.threadId
          : null;
      await uploadDiscussionFile(
        chatGroupId,
        req.erpUser!,
        {
          buffer: file.buffer,
          fileName: file.originalname,
          mimeType: file.mimetype || 'application/octet-stream',
        },
        threadId
      );
      res.json({ success: true });
    } catch (error) {
      sendError(req, res, error);
    }
  }
);

export const createWorkspaceDiscussionRouter = () => {
  const router = express.Router();
  // The mobile app calls these from its own origin (like /graphql). Before
  // authenticate, so CORS preflights (which carry no token) get through.
  router.use(cors());
  router.use(authenticate);
  // fileName may itself contain encoded characters; express decodes it.
  router.get(
    '/committees/:committeeId/discussions/files/:fileId/:fileName',
    streamFile
  );
  router.post('/committees/:committeeId/discussions/files', receiveFile, uploadFile);
  return router;
};
