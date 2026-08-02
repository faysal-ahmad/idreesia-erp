import { WebApp } from 'meteor/webapp';
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
