import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import {
  ATTACHMENT_MAX_FILE_SIZE,
  Permissions,
  TwoFactorErrorCode,
} from 'meteor/idreesia-common/constants';
import { kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import Attachments from 'meteor/idreesia-common/server/collections/common/attachments';
import {
  createStoredAttachment,
  getAttachmentDownloadUrl,
  isAttachmentCategory,
} from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import {
  isTwoFactorCodeValid,
  isTwoFactorEnabled,
} from 'meteor/idreesia-common/server/business-logic/admin';
import { exportKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/karkuns-exporter';
import { exportVisitors } from 'meteor/idreesia-common/server/business-logic/security/visitors-exporter';
import {
  exportIsssuanceForms,
  exportPurchaseForms,
  exportStockAdjustmentForms,
  exportStockItems,
} from 'meteor/idreesia-common/server/business-logic/inventory';

import { createSecurityServerRouter } from './setup-security-server-endpoints';
import { createCorrespondenceRouter } from './setup-correspondence-endpoints';
import { createWorkspaceDiscussionRouter } from './setup-workspace-discussion-endpoints';
import { getBrowserMonitoringConfig } from './newrelic';
import { ACCOUNT_LOCKED_MESSAGE, isAccountLocked } from './account-lock';
import { getUser } from './get-user';

interface RestUser {
  _id: string;
  username?: string;
  locked?: boolean;
  permissions?: string[];
  instances?: string[];
}

type RequestWithUser = Request & { user: RestUser };

interface ReportGenerator {
  generate(reportArgs: string): Promise<unknown>;
  // Same permissions as the GraphQL list query behind the page the report is
  // downloaded from.
  permissions: string[];
  // Reports whose argument is a physical store id also need access to that
  // store, like @checkInstanceAccess on the store's GraphQL queries.
  argIsPhysicalStoreId?: boolean;
}

const ReportGenerators: Record<string, ReportGenerator> = {
  IssuanceForms: {
    generate: exportIsssuanceForms,
    permissions: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
  },
  PurchaseForms: {
    generate: exportPurchaseForms,
    permissions: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
  },
  StockAdjustments: {
    generate: exportStockAdjustmentForms,
    permissions: [
      Permissions.IN_VIEW_STOCK_ADJUSTMENTS,
      Permissions.IN_MANAGE_STOCK_ADJUSTMENTS,
      Permissions.IN_APPROVE_STOCK_ADJUSTMENTS,
    ],
  },
  StockItems: {
    generate: exportStockItems,
    permissions: [Permissions.IN_MANAGE_STOCK_ITEMS],
    argIsPhysicalStoreId: true,
  },
  Karkuns: {
    generate: exportKarkuns,
    permissions: [
      Permissions.HR_VIEW_KARKUNS,
      Permissions.HR_MANAGE_KARKUNS,
      Permissions.HR_VIEW_EMPLOYEES,
      Permissions.HR_MANAGE_EMPLOYEES,
    ],
  },
  Visitors: {
    generate: exportVisitors,
    permissions: [
      Permissions.SECURITY_VIEW_VISITORS,
      Permissions.SECURITY_MANAGE_VISITORS,
    ],
  },
};

/**
 * Requires a valid, unlocked Meteor login token in the Authorization header -
 * the same check the GraphQL endpoint makes - and puts the user on the request.
 */
const requireLogin = Meteor.bindEnvironment(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = (await getUser(req.headers.authorization)) as
      | RestUser
      | undefined;
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    (req as RequestWithUser).user = user;
    next();
  }
);

// Accounts._findUserByQuery/_checkPasswordAsync/_generateStampedLoginToken/
// _insertLoginToken/_tokenExpiration are the same building blocks the
// "password" DDP login handler uses internally to issue a resume token -
// there is no public API for minting one outside of a DDP login, so the
// /login REST endpoint below reuses them directly.
interface AccountsPrivateApi {
  _findUserByQuery(
    query: { username: string } | { email: string },
    options: { fields: Record<string, 0 | 1> }
  ): Promise<
    | {
        _id: string;
        locked?: boolean;
        services?: {
          password?: unknown;
          twoFactorAuthentication?: { secret?: string; type?: string };
        };
      }
    | undefined
  >;
  _checkPasswordAsync(
    user: { _id: string; services?: unknown },
    password: string
  ): Promise<{ userId: string; error?: unknown }>;
  _generateStampedLoginToken(): { token: string; when: Date };
  _insertLoginToken(
    userId: string,
    stampedLoginToken: { token: string; when: Date }
  ): Promise<void>;
  _tokenExpiration(when: Date): Date;
}
const AccountsPrivate = Accounts as unknown as AccountsPrivateApi;

export function setupRestEndpoints() {
  Meteor.startup(() => {
    const app = express();
    const storage = multer.memoryStorage();
    const upload = multer({
      storage,
      limits: { fileSize: ATTACHMENT_MAX_FILE_SIZE, files: 1 },
    });
    const uploadSingleFile = upload.single('file');
    // Answers multer's errors (e.g. LIMIT_FILE_SIZE) with a 4xx instead of
    // passing them on to Express's default HTML error page.
    const parseUploadedFile = (
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      uploadSingleFile(req as any, res as any, (error: unknown) => {
        if (error instanceof multer.MulterError) {
          const tooLarge = error.code === 'LIMIT_FILE_SIZE';
          res
            .status(tooLarge ? 413 : 400)
            .end(
              tooLarge
                ? `The file is larger than ${
                    ATTACHMENT_MAX_FILE_SIZE / (1024 * 1024)
                  } MB.`
                : error.message
            );
          return;
        }
        next(error);
      });
    };

    /**
     * Endpoint for reports generation
     */
    app.get(
      '/generate-report',
      requireLogin,
      bodyParser.urlencoded({ extended: false }),
      Meteor.bindEnvironment(async (req: Request, res: Response) => {
        const { user } = req as RequestWithUser;
        const { reportName, reportArgs } = req.query;
        const reportGenerator =
          typeof reportName === 'string' &&
          Object.prototype.hasOwnProperty.call(ReportGenerators, reportName)
            ? ReportGenerators[reportName]
            : undefined;
        const normalizedReportArgs = Array.isArray(reportArgs)
          ? String(reportArgs[0] ?? '')
          : String(reportArgs ?? '');
        if (reportGenerator) {
          if (
            !hasOnePermission(user, reportGenerator.permissions) ||
            (reportGenerator.argIsPhysicalStoreId &&
              !hasInstanceAccess(user, normalizedReportArgs))
          ) {
            res.status(403).json({ error: 'Not authorized.' });
            return;
          }
          const report = await reportGenerator.generate(normalizedReportArgs);
          res.writeHead(200, {
            'Content-Type': 'application/vnd.ms-excel',
            'Content-Disposition': `attachment; filename=${kebabCase(
              String(reportName)
            )}.xlsx`,
          });
          res.end(report);
        } else {
          // eslint-disable-next-line no-console
          console.warn(`Report generator not found for ${reportName}`);
          res.writeHead(404);
          res.end();
        }
      })
    );

    /**
     * Endpoint for file downloads
     */
    app.get(
      '/download-file',
      requireLogin,
      bodyParser.urlencoded({ extended: false }),
      Meteor.bindEnvironment(async (req: Request, res: Response) => {
        const { attachmentId } = req.query;
        if (typeof attachmentId === 'string') {
          const attachment = await Attachments.findOneAsync(attachmentId);
          if (attachment?.fileKey) {
            // Stored privately in object storage: hand out a short-lived
            // presigned URL rather than streaming it through this server.
            res.redirect(302, await getAttachmentDownloadUrl(attachment.fileKey));
          } else {
            res.writeHead(404);
            res.end();
          }
        } else {
          res.writeHead(404);
          res.end();
        }
      })
    );

    /**
     * Endpoint for file uploads
     */
    app.post(
      '/upload-file',
      requireLogin,
      parseUploadedFile,
      Meteor.bindEnvironment(async (req: Request, res: Response) => {
        const { file } = req as Request & {
          file: Express.Multer.File;
        };
        // Sent as a multipart field (or query param) by UploadAttachment.
        const category = req.body?.category ?? req.query.category;
        if (!file || !isAttachmentCategory(category)) {
          res.writeHead(400);
          res.end('A file and a valid attachment category are required.');
          return;
        }
        const attachmentId = await createStoredAttachment({
          category,
          name: file.originalname,
          mimeType: file.mimetype,
          body: file.buffer,
        });
        res.writeHead(200);
        res.end(attachmentId);
      })
    );

    /**
     * Endpoint for external (non-Meteor) clients to exchange a username/email
     * and password for a Meteor login token, for use as the GraphQL API's
     * `Authorization` header. A user with two-factor authentication on must
     * also send `code`, the current code from their authenticator app.
     */
    app.post(
      '/login',
      bodyParser.json(),
      Meteor.bindEnvironment(async (req: Request, res: Response) => {
        const { username, email, password, code } = req.body ?? {};
        if ((!username && !email) || typeof password !== 'string') {
          res.writeHead(400);
          res.end();
          return;
        }

        const user = await AccountsPrivate._findUserByQuery(
          username ? { username } : { email },
          { fields: { services: 1, locked: 1 } }
        );

        if (!user || !user.services?.password) {
          res.writeHead(401);
          res.end();
          return;
        }

        const { error, userId } = await AccountsPrivate._checkPasswordAsync(
          user,
          password
        );
        if (error) {
          res.writeHead(401);
          res.end();
          return;
        }

        // Checked after the password so the response doesn't reveal whether
        // an account is locked to someone who doesn't know its password.
        if (isAccountLocked(user)) {
          res.writeHead(403, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: ACCOUNT_LOCKED_MESSAGE }));
          return;
        }

        // Same rule the password login enforces through accounts-2fa.
        const twoFactorSecret = user.services.twoFactorAuthentication?.secret;
        if (isTwoFactorEnabled(user) && twoFactorSecret) {
          let twoFactorError: string | null = null;
          if (typeof code !== 'string' || !code) {
            twoFactorError = TwoFactorErrorCode.CODE_REQUIRED;
          } else if (!isTwoFactorCodeValid(twoFactorSecret, code)) {
            twoFactorError = TwoFactorErrorCode.INVALID_CODE;
          }
          if (twoFactorError) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: twoFactorError }));
            return;
          }
        }

        const stampedLoginToken = AccountsPrivate._generateStampedLoginToken();
        await AccountsPrivate._insertLoginToken(userId, stampedLoginToken);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            userId,
            token: stampedLoginToken.token,
            tokenExpires: AccountsPrivate._tokenExpiration(
              stampedLoginToken.when
            ),
          })
        );
      })
    );

    /**
     * Endpoint for base64 image uploads
     */
    app.post(
      '/upload-base64-file',
      requireLogin,
      bodyParser.json({ limit: '5mb' }),
      Meteor.bindEnvironment(async (req: Request, res: Response) => {
        const { name, mimeType, data, category } = req.body;
        if (typeof data !== 'string' || !isAttachmentCategory(category)) {
          res.status(400).send(
            JSON.stringify({
              error: 'Data and a valid attachment category are required.',
            })
          );
          return;
        }
        const attachmentId = await createStoredAttachment({
          category,
          name,
          mimeType: mimeType || 'image/jpeg',
          body: Buffer.from(data, 'base64'),
        });
        res.send(JSON.stringify({ attachmentId }));
      })
    );

    /**
     * Public config for the browser monitoring agent. The client can't read
     * process.env, so it fetches this at startup. Returns 204 when monitoring
     * is disabled. These are New Relic's public browser-agent identifiers
     * (they ship in every page that uses the agent), not secrets.
     */
    app.get('/api/monitoring-config', (req: Request, res: Response) => {
      const config = getBrowserMonitoringConfig();
      if (!config) {
        res.status(204).end();
        return;
      }
      res.json(config);
    });

    /**
     * Endpoints the security server pushes its channels, profiles and alerts to
     */
    app.use('/api/security-server', createSecurityServerRouter());

    /**
     * Media proxy for the Correspondence inbox (files stored in Rocket.Chat)
     */
    app.use('/api/correspondence', createCorrespondenceRouter());

    /**
     * Files of committee discussions in Workspaces (stored in Rocket.Chat)
     */
    app.use('/api/workspaces', createWorkspaceDiscussionRouter());

    WebApp.connectHandlers.use(app as any);
  });
}
