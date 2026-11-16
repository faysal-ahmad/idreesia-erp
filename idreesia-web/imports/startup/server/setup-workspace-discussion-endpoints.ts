import cors from 'cors';
import express from 'express';
import multer from 'multer';
import type { NextFunction, Request, Response } from 'express';

import {
  fetchConversationFile,
  uploadConversationFile,
  MAX_CONVERSATION_FILE_SIZE,
} from 'meteor/idreesia-common/server/business-logic/rocket-chat';

import { sendError } from './rest-errors';
import {
  requireCommitteeDiscussion,
  requireLogin,
  type RequestWithChatGroup,
} from './rest-guards';

/**
 * File routes for committee discussions in the Workspaces module. Files live
 * in Rocket.Chat, which the browser can't reach, so they go through here
 * with the Meteor login token in the Authorization header.
 *
 * Like the GraphQL resolvers, these routes only check access (the
 * committee role + Discussions enabled); the discussions business logic does
 * the rest.
 */

// Rocket.Chat file ids are alphanumeric.
const ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const SOURCE = 'workspace-discussion-files';

const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'last-modified'];

const streamFile = Meteor.bindEnvironment(
  async (req: Request, res: Response) => {
    const fileId = String(req.params.fileId ?? '');
    const fileName = String(req.params.fileName ?? '');
    const signature = String(req.query.sig ?? '');
    if (!ID_PATTERN.test(fileId) || !fileName) {
      res.status(400).json({ error: 'Invalid file path.' });
      return;
    }

    try {
      const upstream = await fetchConversationFile((req as RequestWithChatGroup).chatGroupId, {
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
      sendError(req, res, error, SOURCE);
    }
  }
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_CONVERSATION_FILE_SIZE, files: 1 },
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
  async (req: Request, res: Response) => {
    const file = (req as Request & { file?: Express.Multer.File }).file;
    if (!file) {
      res.status(400).json({ error: 'No file was uploaded.' });
      return;
    }

    try {
      // Optional: posts the file as a reply in that thread.
      const threadId =
        typeof req.body?.threadId === 'string' && req.body.threadId
          ? req.body.threadId
          : null;
      await uploadConversationFile(
        (req as RequestWithChatGroup).chatGroupId,
        (req as RequestWithChatGroup).user,
        {
          buffer: file.buffer,
          fileName: file.originalname,
          mimeType: file.mimetype || 'application/octet-stream',
        },
        threadId
      );
      res.json({ success: true });
    } catch (error) {
      sendError(req, res, error, SOURCE);
    }
  }
);

export const createWorkspaceDiscussionRouter = () => {
  const router = express.Router();
  // The mobile app calls these from its own origin (like /graphql). Before
  // authenticate, so CORS preflights (which carry no token) get through.
  router.use(cors());
  router.use(requireLogin);
  // fileName may itself contain encoded characters; express decodes it.
  router.get(
    '/committees/:committeeId/discussions/files/:fileId/:fileName',
    requireCommitteeDiscussion('read'),
    streamFile
  );
  router.post(
    '/committees/:committeeId/discussions/files',
    requireCommitteeDiscussion('write'),
    receiveFile,
    uploadFile
  );
  return router;
};
