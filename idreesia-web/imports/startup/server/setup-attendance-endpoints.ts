import bodyParser from 'body-parser';
import express from 'express';
import type { Request, Response } from 'express';

import {
  findKarkunRecordByFaceImage,
  recordKarkunCheckIn,
} from 'meteor/idreesia-common/server/business-logic/hr/attendance-kiosk';

import { sendError } from './rest-errors';
import { limitRequests } from './rate-limits';

/**
 * Public endpoints of the attendance kiosk (the /attendance page), which has
 * no logged-in user. POST /api/attendance/match takes a photo and answers
 * with the name, photo, this month's duty attendance and today's duties of the
 * karkun it best matches, with a short-lived signed token. POST /check-in and
 * /check-out take that token and answer with the updated record. It is open on
 * purpose, so it is on rest-guards-coverage.test.ts's ALLOWED list and is
 * limited per client address.
 */

// A JPEG captured from the kiosk camera, as a base64 data URL.
const BODY_SIZE_LIMIT = '5mb';

const matchKarkun = async (req: Request, res: Response) => {
  const imageData = req.body?.imageData;
  if (typeof imageData !== 'string' || !imageData) {
    res.status(400).json({ error: 'imageData is required.' });
    return;
  }

  try {
    res.set('Cache-Control', 'no-store');
    res.json(await findKarkunRecordByFaceImage(imageData));
  } catch (error) {
    sendError(req, res, error, 'attendance-match');
  }
};

const recordCheckIn = (action: 'check-in' | 'check-out') => async (req: Request, res: Response) => {
  const token = req.body?.token;
  if (typeof token !== 'string' || !token) {
    res.status(400).json({ error: 'token is required.' });
    return;
  }

  try {
    res.set('Cache-Control', 'no-store');
    res.json({ status: 'computed', match: await recordKarkunCheckIn(token, action) });
  } catch (error) {
    sendError(req, res, error, `attendance-${action}`);
  }
};

export const createAttendanceRouter = () => {
  const router = express.Router();
  router.use(limitRequests);
  router.use(bodyParser.json({ limit: BODY_SIZE_LIMIT }));
  router.post('/match', matchKarkun);
  router.post('/check-in', recordCheckIn('check-in'));
  router.post('/check-out', recordCheckIn('check-out'));
  return router;
};
