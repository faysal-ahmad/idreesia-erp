import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import {
  ATTACHMENT_MAX_FILE_SIZE,
  isAllowedAttachmentMimeType,
  Permissions,
  TwoFactorErrorCode,
} from 'meteor/idreesia-common/constants';
import { kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import {
  hasInstanceAccess,
  hasOnePermission,
} from 'meteor/idreesia-common/server/graphql-api/security';
import {
  assertCanViewAttachment,
  canUploadAttachment,
} from 'meteor/idreesia-common/server/graphql-api/common/attachment/access';
import {
  createStoredAttachment,
  getAttachmentDownloadUrl,
  isAttachmentCategory,
} from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import {
  clearLoginAttempts,
  consumeTwoFactorCode,
  isTwoFactorEnabled,
  reserveLoginAttempt,
  TOO_MANY_ATTEMPTS_ERROR,
} from 'meteor/idreesia-common/server/business-logic/admin';
import { exportKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/karkuns-exporter';
import { exportVisitors } from 'meteor/idreesia-common/server/business-logic/security/visitors-exporter';
import {
  exportIsssuanceForms,
  exportPurchaseForms,
  exportStockAdjustmentForms,
  exportStockItems,
  getIssuanceFormStoreIds,
  getPurchaseFormStoreIds,
  getStockAdjustmentStoreIds,
} from 'meteor/idreesia-common/server/business-logic/inventory';

import { createSecurityServerRouter } from './setup-security-server-endpoints';
import { createCorrespondenceRouter } from './setup-correspondence-endpoints';
import { createWorkspaceDiscussionRouter } from './setup-workspace-discussion-endpoints';
import { createDiagnosticsRouter } from './setup-diagnostics-endpoints';
import { getBrowserMonitoringConfig } from './newrelic';
import { ACCOUNT_LOCKED_MESSAGE, isAccountLocked } from './account-lock';
import { getClientAddress, getThrottleAddress } from './client-address';
import { getUser } from './get-user';
import { limitRequests, limitUploads } from './rate-limits';

interface RestUser {
  _id: string;
  username?: string;
  locked?: boolean;
  isSuperAdmin?: boolean;
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
  // Reports whose argument is a list of form ids also need access to the
  // store of every one of those forms.
  storeIdsOf?(reportArgs: string): Promise<string[]>;
}

const ReportGenerators: Record<string, ReportGenerator> = {
  IssuanceForms: {
    generate: exportIsssuanceForms,
    storeIdsOf: getIssuanceFormStoreIds,
    permissions: [
      Permissions.IN_VIEW_ISSUANCE_FORMS,
      Permissions.IN_MANAGE_ISSUANCE_FORMS,
      Permissions.IN_APPROVE_ISSUANCE_FORMS,
    ],
  },
  PurchaseForms: {
    generate: exportPurchaseForms,
    storeIdsOf: getPurchaseFormStoreIds,
    permissions: [
      Permissions.IN_VIEW_PURCHASE_FORMS,
      Permissions.IN_MANAGE_PURCHASE_FORMS,
      Permissions.IN_APPROVE_PURCHASE_FORMS,
    ],
  },
  StockAdjustments: {
    generate: exportStockAdjustmentForms,
    storeIdsOf: getStockAdjustmentStoreIds,
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

    // Request rate limits (rate-limits.ts) for every endpoint below except
    // the security server's push endpoints (unlimited) and diagnostics
    // (limited by its own router). Registered by method so that
    // page loads of the same paths (served by Meteor) aren't counted.
    app.get(['/generate-report', '/download-file'], limitRequests);
    app.get('/api/monitoring-config', limitRequests);
    app.post(['/login', '/upload-file', '/upload-base64-file'], limitRequests);
    app.use(['/api/correspondence', '/api/workspaces'], limitRequests);
    app.post(
      [
        '/upload-file',
        '/upload-base64-file',
        '/api/workspaces/committees/:committeeId/discussions/files',
      ],
      limitUploads
    );

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
          const storeIds = reportGenerator.storeIdsOf
            ? await reportGenerator.storeIdsOf(normalizedReportArgs)
            : [];
          if (
            !hasOnePermission(user, reportGenerator.permissions) ||
            (reportGenerator.argIsPhysicalStoreId &&
              !hasInstanceAccess(user, normalizedReportArgs)) ||
            storeIds.some(storeId => !hasInstanceAccess(user, storeId))
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
        const { user } = req as RequestWithUser;
        const { attachmentId } = req.query;
        if (typeof attachmentId !== 'string') {
          res.writeHead(404);
          res.end();
          return;
        }
        try {
          // The user needs the permission of the feature the attachment
          // belongs to, and access to the store of the form that holds it.
          const attachment = await assertCanViewAttachment(user, attachmentId);
          if (attachment.fileKey) {
            // Stored privately in object storage: hand out a short-lived
            // presigned URL rather than streaming it through this server.
            res.redirect(302, await getAttachmentDownloadUrl(attachment.fileKey));
          } else {
            res.writeHead(404);
            res.end();
          }
        } catch (error) {
          const code = (error as { extensions?: { code?: string } }).extensions?.code;
          if (code === 'FORBIDDEN') {
            res.status(403).json({ error: 'Not authorized.' });
          } else if (code === 'NOT_FOUND') {
            res.writeHead(404);
            res.end();
          } else {
            throw error;
          }
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
        if (!canUploadAttachment((req as RequestWithUser).user, category)) {
          res.writeHead(403);
          res.end('Not authorized.');
          return;
        }
        // The stored type is what object storage serves the file as, so
        // only accept types a browser won't run as a page (no HTML or SVG).
        if (!isAllowedAttachmentMimeType(file.mimetype)) {
          res.writeHead(400);
          res.end('This type of file is not allowed.');
          return;
        }
        const attachmentId = await createStoredAttachment({
          category,
          name: file.originalname,
          mimeType: file.mimetype,
          body: file.buffer,
          createdBy: (req as RequestWithUser).user._id,
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

        // Counted before the password is checked, and refused before it is,
        // so a blocked attempt doesn't reveal whether the password was right.
        // Same throttle as the Meteor password login (login-throttle.ts).
        const clientAddress = getThrottleAddress(getClientAddress(req));
        if (!(await reserveLoginAttempt(user._id, clientAddress))) {
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: TOO_MANY_ATTEMPTS_ERROR }));
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

        // Same rule the password login enforces through accounts-2fa, and
        // each code works only once (login-throttle.ts).
        const twoFactorSecret = user.services.twoFactorAuthentication?.secret;
        if (isTwoFactorEnabled(user) && twoFactorSecret) {
          let twoFactorError: string | null = null;
          if (typeof code !== 'string' || !code) {
            twoFactorError = TwoFactorErrorCode.CODE_REQUIRED;
          } else if (
            !(await consumeTwoFactorCode(userId, twoFactorSecret, code))
          ) {
            twoFactorError = TwoFactorErrorCode.INVALID_CODE;
          }
          if (twoFactorError) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: twoFactorError }));
            return;
          }
        }

        await clearLoginAttempts(userId, clientAddress);

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
        const { name, data, category } = req.body;
        const mimeType = req.body.mimeType || 'image/jpeg';
        if (typeof data !== 'string' || !isAttachmentCategory(category)) {
          res.status(400).send(
            JSON.stringify({
              error: 'Data and a valid attachment category are required.',
            })
          );
          return;
        }
        // Same rules as /upload-file.
        if (!canUploadAttachment((req as RequestWithUser).user, category)) {
          res.status(403).send(JSON.stringify({ error: 'Not authorized.' }));
          return;
        }
        if (!isAllowedAttachmentMimeType(mimeType)) {
          res.status(400).send(
            JSON.stringify({ error: 'This type of file is not allowed.' })
          );
          return;
        }
        const attachmentId = await createStoredAttachment({
          category,
          name,
          mimeType,
          body: Buffer.from(data, 'base64'),
          createdBy: (req as RequestWithUser).user._id,
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

    /**
     * Echo of the request as received, for checking the proxy chain and
     * HTTP_FORWARDED_COUNT (docs/request-diagnostics.md). Rate limited by
     * its own router.
     */
    app.use('/api/diagnostics', createDiagnosticsRouter());

    WebApp.connectHandlers.use(app as any);
  });
}
