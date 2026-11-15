import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import type { Options } from 'express-rate-limit';
import type { NextFunction, Request, Response } from 'express';

import { getClientAddress } from './client-address';
import { getUser } from './get-user';

// Request rate limits for /graphql and the REST endpoints (not the security
// server's push endpoints, which are machine-to-machine and authenticate with
// their own key). A logged-in user is counted by user id, across all their
// sessions; anything else by client address. Requests are counted in this
// process's memory, so each web instance allows the limit on its own and a
// restart resets the counts - enough to stop a flood, without a database
// write per request.
//
// These are separate from the per-account login and two-factor throttle
// (business-logic/admin/users/login-attempts.ts), which stops slow password
// guessing that stays well under any request rate.

const WINDOW_MS = 60 * 1000;
export const USER_REQUESTS_PER_MINUTE = 300;
export const ANONYMOUS_REQUESTS_PER_MINUTE = 60;
export const UPLOADS_PER_MINUTE = 30;

const TOO_MANY_REQUESTS_MESSAGE =
  'Too many requests. Please wait a moment and try again.';

type LoggedInUser = Awaited<ReturnType<typeof getUser>>;
export type RequestWithLoggedInUser = Request & {
  loggedInUser?: LoggedInUser;
};

/**
 * Looks up the user the request's login token belongs to (undefined if none,
 * invalid, expired or locked) and keeps it on the request, so a forged
 * Authorization header is counted by address rather than as a new user.
 * Handlers after it can use req.loggedInUser instead of looking it up again.
 */
export const resolveLoggedInUser = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const request = req as RequestWithLoggedInUser;
  if ('loggedInUser' in request) {
    next();
    return;
  }
  getUser(req.headers.authorization).then(user => {
    request.loggedInUser = user;
    next();
  }, next);
};

const getRateLimitKey = (req: Request) => {
  const user = (req as RequestWithLoggedInUser).loggedInUser;
  return user
    ? `user:${user._id}`
    : `address:${ipKeyGenerator(getClientAddress(req) ?? 'unknown')}`;
};

const commonOptions: Partial<Options> = {
  windowMs: WINDOW_MS,
  keyGenerator: getRateLimitKey,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  // CORS preflights carry no login token and are answered by cors().
  skip: req => req.method === 'OPTIONS',
  // The client address comes from getClientAddress (HTTP_FORWARDED_COUNT),
  // not from Express's req.ip and 'trust proxy', so the library's checks of
  // those don't apply.
  validate: { ip: false, trustProxy: false, xForwardedForHeader: false },
  handler: (_req, res, _next, options) => {
    res.status(options.statusCode).json({ error: TOO_MANY_REQUESTS_MESSAGE });
  },
};

const requestLimiter = rateLimit({
  ...commonOptions,
  limit: req =>
    (req as RequestWithLoggedInUser).loggedInUser
      ? USER_REQUESTS_PER_MINUTE
      : ANONYMOUS_REQUESTS_PER_MINUTE,
});

const uploadLimiter = rateLimit({
  ...commonOptions,
  limit: UPLOADS_PER_MINUTE,
});

/** The general request limit, for every rate-limited route. */
export const limitRequests = [resolveLoggedInUser, requestLimiter];

/** The extra limit on file uploads, after limitRequests. */
export const limitUploads = [resolveLoggedInUser, uploadLimiter];
