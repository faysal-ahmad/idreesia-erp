import { WebApp } from "meteor/webapp";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";

import Attachments from "/imports/lib/collections/common/attachments";

Meteor.startup(() => {
  const app = express();
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  /**
   * Endpoint for file downloads
   */
  app.get(
    "/download-file",
    bodyParser.urlencoded({ extended: false }),
    Meteor.bindEnvironment((req, res) => {
      const { attachmentId } = req.query;
      if (attachmentId) {
        const attachment = Attachments.findOne(attachmentId);
        const imgData = Buffer.from(attachment.data, "base64");
        res.writeHead(200, {
          "Content-Type": attachment.mimeType,
        });
        res.end(imgData);
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
    "/upload-file",
    upload.single("file"),
    Meteor.bindEnvironment((req, res) => {
      const { file } = req;
      const attachment = {
        name: file.originalname,
        mimeType: file.mimetype,
        data: file.buffer.toString("base64"),
      };
      const attachmentId = Attachments.insert(attachment);
      res.writeHead(200);
      // res.write(attachmentId);
      res.end(attachmentId);
    })
  );

  WebApp.connectHandlers.use(app);
});
