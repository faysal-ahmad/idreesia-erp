import type { Request, Response } from 'express';
import { GraphQLError } from 'graphql';

import { noticeError } from './newrelic';

const STATUS_BY_CODE: Record<string, number> = {
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_USER_INPUT: 400,
  PAYLOAD_TOO_LARGE: 413,
  DISCUSSION_FAILED: 502,
};

/**
 * Answers a REST request with the JSON error for a failure thrown by the
 * business logic. A GraphQLError (what the shared access helpers throw) is
 * mapped to the HTTP status of its code; anything else is a 500 that is
 * reported to New Relic, tagged with `source`.
 */
export const sendError = (
  req: Request,
  res: Response,
  error: unknown,
  source: string
) => {
  if (error instanceof GraphQLError) {
    const code = String(error.extensions?.code ?? '');
    const status = STATUS_BY_CODE[code] ?? 500;
    if (status >= 500) {
      noticeError(error, { source, path: req.path });
    }
    res.status(status).json({ error: error.message });
    return;
  }
  // eslint-disable-next-line no-console
  console.error(`${source} failed`, error);
  noticeError(error, { source, path: req.path });
  res.status(500).json({ error: 'Something went wrong.' });
};
