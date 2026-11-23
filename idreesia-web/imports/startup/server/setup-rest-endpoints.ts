import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';

import { ATTACHMENT_MAX_FILE_SIZE } from 'meteor/idreesia-common/constants';
import { kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import { assertCanViewAttachment } from 'meteor/idreesia-common/server/graphql-api/common/attachment/access';
import {
  asReportName,
  canDownloadReport,
  type ReportName,
} from 'meteor/idreesia-common/server/rest-api/report-access';
import {
  decideAttachmentUpload,
  downloadErrorStatus,
} from 'meteor/idreesia-common/server/rest-api/attachment-upload-access';
import { passwordLogin } from 'meteor/idreesia-common/server/rest-api/password-login';
import {
  createStoredAttachment,
  getAttachmentDownloadUrl,
} from 'meteor/idreesia-common/server/business-logic/common/stored-attachments';
import {
  clearLoginAttempts,
  consumeTwoFactorCode,
  isTwoFactorEnabled,
  reserveLoginAttempt,
} from 'meteor/idreesia-common/server/business-logic/admin';
import { exportKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/karkuns-exporter';
import { exportVisitors } from 'meteor/idreesia-common/server/business-logic/security/visitors-exporter';
import {
  exportPurchasingOpenOrders,
  exportPurchasingPayablesAging,
  exportPurchasingSpendingByMonth,
  exportPurchasingSpendingByVendor,
  exportPurchasingVendorLedger,
} from 'meteor/idreesia-common/server/business-logic/purchasing/exporters';
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
import { createAttendanceRouter } from './setup-attendance-endpoints';
import { createDiagnosticsRouter } from './setup-diagnostics-endpoints';
import { getBrowserMonitoringConfig } from './newrelic';
import { getClientAddress, getThrottleAddress } from './client-address';
import { requireLogin, type RequestWithUser } from './rest-guards';
import { limitRequests, limitUploads } from './rate-limits';

interface ReportGenerator {
  generate(reportArgs: string): Promise<unknown>;
  // Reports whose argument is a list of form ids also need access to the
  // store of every one of those forms.
  storeIdsOf?(reportArgs: string): Promise<string[]>;
}

// Who may download each report is in rest-api/report-access.ts.
const ReportGenerators: Record<ReportName, ReportGenerator> = {
  IssuanceForms: {
    generate: exportIsssuanceForms,
    storeIdsOf: getIssuanceFormStoreIds,
  },
  PurchaseForms: {
    generate: exportPurchaseForms,
    storeIdsOf: getPurchaseFormStoreIds,
  },
  StockAdjustments: {
    generate: exportStockAdjustmentForms,
    storeIdsOf: getStockAdjustmentStoreIds,
  },
  StockItems: { generate: exportStockItems },
  Karkuns: { generate: exportKarkuns },
  Visitors: { generate: exportVisitors },
  PurchasingSpendingByVendor: { generate: exportPurchasingSpendingByVendor },
  PurchasingSpendingByMonth: { generate: exportPurchasingSpendingByMonth },
  PurchasingOpenOrders: { generate: () => exportPurchasingOpenOrders() },
  PurchasingPayablesAging: { generate: () => exportPurchasingPayablesAging() },
  PurchasingVendorLedger: { generate: exportPurchasingVendorLedger },
};

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

// The Express app with every REST route, built apart from Meteor's web server
// so that rest-guards-coverage.test.ts can check each route is guarded.
export function createRestApp() {
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
      const knownReport = asReportName(reportName);
      const reportGenerator = knownReport
        ? ReportGenerators[knownReport]
        : undefined;
      const normalizedReportArgs = Array.isArray(reportArgs)
        ? String(reportArgs[0] ?? '')
        : String(reportArgs ?? '');
      if (knownReport && reportGenerator) {
        const storeIds = reportGenerator.storeIdsOf
          ? await reportGenerator.storeIdsOf(normalizedReportArgs)
          : [];
        if (
          !canDownloadReport(user, knownReport, normalizedReportArgs, storeIds)
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
        const status = downloadErrorStatus(error);
        if (status === 403) {
          res.status(403).json({ error: 'Not authorized.' });
        } else if (status === 404) {
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
      const decision = decideAttachmentUpload(
        (req as RequestWithUser).user,
        {
          category: req.body?.category ?? req.query.category,
          hasContent: !!file,
          mimeType: file?.mimetype,
        }
      );
      if (!decision.ok) {
        if (decision.reason === 'invalid') {
          res.writeHead(400);
          res.end('A file and a valid attachment category are required.');
        } else if (decision.reason === 'forbidden') {
          res.writeHead(403);
          res.end('Not authorized.');
        } else {
          res.writeHead(400);
          res.end('This type of file is not allowed.');
        }
        return;
      }
      const { category } = decision;
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
      const clientAddress = getThrottleAddress(getClientAddress(req));
      const result = await passwordLogin(req.body ?? {}, {
        findUser: query =>
          AccountsPrivate._findUserByQuery(query, {
            fields: { services: 1, locked: 1 },
          }),
        reserveAttempt: userId => reserveLoginAttempt(userId, clientAddress),
        checkPassword: (user, password) =>
          AccountsPrivate._checkPasswordAsync(user, password),
        isTwoFactorEnabled,
        consumeTwoFactorCode,
        clearAttempts: userId => clearLoginAttempts(userId, clientAddress),
        issueToken: async userId => {
          const stampedLoginToken = AccountsPrivate._generateStampedLoginToken();
          await AccountsPrivate._insertLoginToken(userId, stampedLoginToken);
          return {
            token: stampedLoginToken.token,
            tokenExpires: AccountsPrivate._tokenExpiration(
              stampedLoginToken.when
            ),
          };
        },
      });
      res.writeHead(result.status, { 'Content-Type': 'application/json' });
      res.end(result.body ? JSON.stringify(result.body) : undefined);
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
      const decision = decideAttachmentUpload(
        (req as RequestWithUser).user,
        { category, hasContent: typeof data === 'string', mimeType }
      );
      if (!decision.ok) {
        if (decision.reason === 'invalid') {
          res.status(400).send(
            JSON.stringify({
              error: 'Data and a valid attachment category are required.',
            })
          );
        } else if (decision.reason === 'forbidden') {
          res.status(403).send(JSON.stringify({ error: 'Not authorized.' }));
        } else {
          res.status(400).send(
            JSON.stringify({ error: 'This type of file is not allowed.' })
          );
        }
        return;
      }
      const attachmentId = await createStoredAttachment({
        category: decision.category,
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
   * (they ship in every page that uses the agent), not secrets. CORS is open
   * because the mobile app (Cordova, a different origin) fetches it too.
   */
  app.get('/api/monitoring-config', cors(), (req: Request, res: Response) => {
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

  /**
   * Public attendance kiosk: matches a face photo to a karkun. Rate limited
   * by its own router.
   */
  app.use('/api/attendance', createAttendanceRouter());

  return app;
}

export function setupRestEndpoints() {
  Meteor.startup(() => {
    WebApp.connectHandlers.use(createRestApp() as any);
  });
}
