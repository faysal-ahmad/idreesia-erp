import { WebApp } from 'meteor/webapp';
import { Accounts } from 'meteor/accounts-base';
import express from 'express';
import multer from 'multer';
import bodyParser from 'body-parser';
import type { Request, Response } from 'express';

import { kebabCase } from 'meteor/idreesia-common/utilities/lodash';
import Attachments from 'meteor/idreesia-common/server/collections/common/attachments';
import { exportKarkuns } from 'meteor/idreesia-common/server/business-logic/hr/karkuns-exporter';
import { exportVisitors } from 'meteor/idreesia-common/server/business-logic/security/visitors-exporter';
import {
  exportIsssuanceForms,
  exportPurchaseForms,
  exportStockAdjustmentForms,
  exportStockItems,
} from 'meteor/idreesia-common/server/business-logic/inventory';

const ReportGenerators = {
  IssuanceForms: exportIsssuanceForms,
  PurchaseForms: exportPurchaseForms,
  StockAdjustments: exportStockAdjustmentForms,
  StockItems: exportStockItems,
  Karkuns: exportKarkuns,
  Visitors: exportVisitors,
  OutstationKarkuns: exportKarkuns,
  OutstationMembers: exportVisitors,
};
type ReportName = keyof typeof ReportGenerators;

// Accounts._findUserByQuery/_checkPasswordAsync/_generateStampedLoginToken/
// _insertLoginToken/_tokenExpiration are the same building blocks the
// "password" DDP login handler uses internally to issue a resume token -
// there is no public API for minting one outside of a DDP login, so the
// /login REST endpoint below reuses them directly.
interface AccountsPrivateApi {
  _findUserByQuery(
    query: { username: string } | { email: string },
    options: { fields: Record<string, 0 | 1> }
  ): Promise<{ _id: string; services?: { password?: unknown } } | undefined>;
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

Meteor.startup(() => {
  const app = express();
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  /**
   * Endpoint for reports generation
   */
  app.get(
    '/generate-report',
    bodyParser.urlencoded({ extended: false }),
    Meteor.bindEnvironment(async (req: Request, res: Response) => {
      const { reportName, reportArgs } = req.query;
      const reportGenerator =
        typeof reportName === 'string'
          ? ReportGenerators[reportName as ReportName]
          : undefined;
      const normalizedReportArgs = Array.isArray(reportArgs)
        ? String(reportArgs[0] ?? '')
        : String(reportArgs ?? '');
      if (reportGenerator) {
        const report = await reportGenerator(normalizedReportArgs);
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
    bodyParser.urlencoded({ extended: false }),
    Meteor.bindEnvironment(async (req: Request, res: Response) => {
      const { attachmentId } = req.query;
      if (typeof attachmentId === 'string') {
        const attachment = await Attachments.findOneAsync(attachmentId);
        if (attachment) {
          const imgData = Buffer.from(attachment.data, 'base64');
          res.removeHeader('Pragma');
          res.removeHeader('Expires');
          res.writeHead(200, {
            'Content-Type': attachment.mimeType,
            'Cache-Control': `max-age=${365 * 24 * 60 * 60}`,
          });
          res.end(imgData);
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
    upload.single('file') as any,
    Meteor.bindEnvironment(async (req: Request, res: Response) => {
      const { file } = req as Request & {
        file: Express.Multer.File;
      };
      const attachment = {
        name: file.originalname,
        mimeType: file.mimetype,
        data: file.buffer.toString('base64'),
      };
      const attachmentId = await Attachments.insertAsync(attachment);
      res.writeHead(200);
      res.end(attachmentId);
    })
  );

  /**
   * Endpoint for external (non-Meteor) clients to exchange a username/email
   * and password for a Meteor login token, for use as the GraphQL API's
   * `Authorization` header.
   */
  app.post(
    '/login',
    bodyParser.json(),
    Meteor.bindEnvironment(async (req: Request, res: Response) => {
      const { username, email, password } = req.body ?? {};
      if ((!username && !email) || typeof password !== 'string') {
        res.writeHead(400);
        res.end();
        return;
      }

      const user = await AccountsPrivate._findUserByQuery(
        username ? { username } : { email },
        { fields: { services: 1 } }
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
    bodyParser.json({ limit: '5mb' }),
    Meteor.bindEnvironment(async (req: Request, res: Response) => {
      const { name, mimeType, data } = req.body;
      const attachment = {
        name,
        mimeType,
        data,
      };
      const attachmentId = await Attachments.insertAsync(attachment);
      res.send(JSON.stringify({ attachmentId }));
    })
  );

  WebApp.connectHandlers.use(app as any);
});
