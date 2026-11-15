import express from 'express';
import type { Request, Response } from 'express';

import { getClientAddress } from './client-address';
import { limitRequests } from './rate-limits';

/**
 * Diagnostics for the hosting setup. GET /api/diagnostics/request echoes the
 * request as the ERP received it (headers, socket address) and the client
 * address the ERP derives from it, so the proxy chain in front of the app
 * (App Platform's Cloudflare edge and ingress) can be checked against
 * HTTP_FORWARDED_COUNT without deploying a separate echo app.
 *
 * It needs no login, so it can be called with plain curl: it only reflects
 * the caller's own request, and everything in it already passed through
 * the public proxies. The login token and cookies, if sent, are left out of
 * the echoed headers.
 *
 * Usage is documented in docs/request-diagnostics.md.
 */

// Echoed back as "[redacted]" rather than dropped, so it's clear they arrived.
const REDACTED_HEADERS = new Set(['authorization', 'cookie']);

const echoRequest = (req: Request, res: Response) => {
  const headers = Object.fromEntries(
    Object.entries(req.headers).map(([name, value]) => [
      name,
      REDACTED_HEADERS.has(name) ? '[redacted]' : value,
    ])
  );

  res.set('Cache-Control', 'no-store');
  res.json({
    method: req.method,
    path: req.originalUrl,
    headers,
    socketAddress: req.socket.remoteAddress ?? null,
    httpForwardedCount: process.env.HTTP_FORWARDED_COUNT ?? null,
    // What the rate limits and (through Meteor's own copy of the same rule)
    // a DDP connection's clientAddress resolve this request to.
    clientAddress: getClientAddress(req),
  });
};

export const createDiagnosticsRouter = () => {
  const router = express.Router();
  // Anonymous callers get the anonymous per-address limit.
  router.use(limitRequests);
  router.get('/request', echoRequest);
  return router;
};
