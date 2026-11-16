import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';

vi.mock('./get-user', () => ({ getUser: vi.fn() }));

import { getUser } from './get-user';
import { resolveLoggedInUser, type RequestWithLoggedInUser } from './rate-limits';

const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;

const makeReq = (authorization?: string) =>
  ({ headers: authorization ? { authorization } : {} }) as unknown as Request;

const run = (req: Request) =>
  new Promise<unknown>(resolve => {
    resolveLoggedInUser(req, {} as Response, err => resolve(err));
  });

describe('resolveLoggedInUser', () => {
  it('puts the resolved user on the request', async () => {
    getUserMock.mockResolvedValueOnce({ _id: 'u1' });
    const req = makeReq('tok');
    await run(req);
    expect((req as RequestWithLoggedInUser).loggedInUser).toEqual({ _id: 'u1' });
    expect(getUserMock).toHaveBeenCalledWith('tok');
  });

  it('records undefined for a forged token, so it is counted by address', async () => {
    getUserMock.mockResolvedValueOnce(undefined);
    const req = makeReq('forged');
    await run(req);
    expect('loggedInUser' in req).toBe(true);
    expect((req as RequestWithLoggedInUser).loggedInUser).toBeUndefined();
  });

  it('does not look the user up twice for one request', async () => {
    getUserMock.mockClear();
    getUserMock.mockResolvedValue({ _id: 'u1' });
    const req = makeReq('tok');
    await run(req);
    await run(req);
    expect(getUserMock).toHaveBeenCalledTimes(1);
  });

  it('passes a lookup failure to next', async () => {
    getUserMock.mockRejectedValueOnce(new Error('db down'));
    expect(await run(makeReq('tok'))).toEqual(new Error('db down'));
  });
});
