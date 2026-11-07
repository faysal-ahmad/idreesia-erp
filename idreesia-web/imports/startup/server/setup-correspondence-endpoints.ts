import express from 'express';
import type { NextFunction, Request, Response } from 'express';

import { Permissions } from 'meteor/idreesia-common/constants';
import { hasOnePermission } from 'meteor/idreesia-common/server/graphql-api/security';
import {
  fetchUploadedFile,
  ChatError,
} from 'meteor/idreesia-common/server/chat';

import { getUser } from './get-user';
import { noticeError } from './newrelic';

/**
 * Media proxy for the Correspondence inbox. Files that customers upload live
 * in Rocket.Chat, which the browser can't (and shouldn't) reach. The browser
 * requests them here with its Meteor login token in the Authorization header;
 * the ERP checks the inbox permission and streams the file from Rocket.Chat
 * with the service account's credentials.
 *
 * Only `/file-upload/<fileId>/<fileName>` is ever requested from Rocket.Chat,
 * built from the path segments, so this can't be used to fetch arbitrary
 * URLs. Rocket.Chat only serves Livechat files to room members, so the file is
 * fetched with the room's visitor credentials (see fetchUploadedFile).
 */

// Rocket.Chat room and file ids are alphanumeric.
const FILE_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const authenticate = Meteor.bindEnvironment(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (await getUser(req.headers.authorization)) as
      | { _id: string; username?: string; locked?: boolean; permissions?: string[] }
      | undefined;
    if (!user) {
      // eslint-disable-next-line no-console
      console.warn(`Correspondence file proxy: 401 for ${req.path} (no valid login token)`);
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }

    // Same rule as GraphQL's @checkPermissions: hasOnePermission lets
    // erp-admin through and refuses other locked users.
    if (
      !hasOnePermission(user, [
        Permissions.CORRESPONDENCE_INBOX_VIEW_MESSAGES,
      ])
    ) {
      // eslint-disable-next-line no-console
      console.warn(`Correspondence file proxy: 403 for ${req.path} (user ${user._id} lacks the inbox permission or is locked)`);
      res.status(403).json({ error: 'Not authorized.' });
      return;
    }

    next();
  }
);

const PASSTHROUGH_HEADERS = ['content-type', 'content-length', 'last-modified'];

const streamFile = Meteor.bindEnvironment(
  async (req: Request, res: Response) => {
    const roomId = String(req.params.roomId ?? '');
    const fileId = String(req.params.fileId ?? '');
    const fileName = String(req.params.fileName ?? '');
    if (!FILE_ID_PATTERN.test(roomId) || !FILE_ID_PATTERN.test(fileId) || !fileName) {
      // eslint-disable-next-line no-console
      console.warn(`Correspondence file proxy: 400 for ${req.path} (invalid path)`);
      res.status(400).json({ error: 'Invalid file path.' });
      return;
    }

    try {
      const upstream = await fetchUploadedFile(roomId, fileId, fileName);
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
        // Failed mid-stream; nothing useful can be sent any more.
        res.destroy();
        return;
      }
      if (error instanceof ChatError && [403, 404].includes(error.statusCode)) {
        // eslint-disable-next-line no-console
        console.warn(
          `Correspondence file proxy: chat server answered ${error.statusCode} for ${req.path}`
        );
        res.status(404).json({ error: 'File not found.' });
        return;
      }
      // eslint-disable-next-line no-console
      console.error('Correspondence file proxy failed', error);
      noticeError(error, { source: 'correspondence-files', path: req.path });
      res.status(502).json({ error: 'Could not load the file.' });
    }
  }
);

export const createCorrespondenceRouter = () => {
  const router = express.Router();
  router.use(authenticate);
  // fileName may itself contain encoded characters; express decodes it.
  router.get('/files/:roomId/:fileId/:fileName', streamFile);
  return router;
};
