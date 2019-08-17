import { WebApp } from "meteor/webapp";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";

import Attachments from "meteor/idreesia-common/collections/common/attachments";
import Configurations from "meteor/idreesia-common/collections/common/configurations";

Meteor.startup(() => {
  const app = express();
  const storage = multer.memoryStorage();
  const upload = multer({ storage });

  /**
   * Prints the ngrok redirect url
   */
  app.get(
    "/redirect",
    Meteor.bindEnvironment((req, res) => {
      const config = Configurations.findOne({ name: "ngrok_url" });
      if (config) {
        res.redirect(config.value);
      } else {
        res.writeHead(404);
        res.end();
      }
    })
  );

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
        if (attachment) {
          const imgData = Buffer.from(attachment.data, "base64");
          res.writeHead(200, {
            "Content-Type": attachment.mimeType,
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
      res.end(attachmentId);
    })
  );

  /**
   * Endpoint for base64 image uploads
   */
  app.post(
    "/upload-base64-file",
    bodyParser.json({ limit: "5mb" }),
    Meteor.bindEnvironment((req, res) => {
      const { name, mimeType, data } = req.body;
      const attachment = {
        name,
        mimeType,
        data,
      };
      const attachmentId = Attachments.insert(attachment);
      res.send(JSON.stringify({ attachmentId }));
    })
  );

  WebApp.connectHandlers.use(app);
});
