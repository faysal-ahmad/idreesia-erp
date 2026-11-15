import type { Request } from 'express';

/**
 * The address of the client that sent the request. Behind proxies (App
 * Platform's load balancer), set HTTP_FORWARDED_COUNT to the number of
 * proxies in front of the app - the same setting Meteor uses for a DDP
 * connection's clientAddress - and the address is read from the
 * X-Forwarded-For entry the outermost proxy added. Entries further left are
 * set by the client and can't be trusted.
 */
export const getClientAddress = (req: Request): string | null => {
  const forwardedCount = parseInt(process.env.HTTP_FORWARDED_COUNT ?? '', 10);
  if (forwardedCount > 0) {
    const forwardedFor = String(req.headers['x-forwarded-for'] ?? '')
      .split(',')
      .map(entry => entry.trim())
      .filter(Boolean);
    if (forwardedFor.length >= forwardedCount) {
      return forwardedFor[forwardedFor.length - forwardedCount];
    }
  }
  return req.socket.remoteAddress ?? null;
};
