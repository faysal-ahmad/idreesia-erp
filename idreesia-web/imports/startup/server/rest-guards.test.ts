import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GraphQLError } from 'graphql';
import type { Request, Response } from 'express';

vi.mock('./get-user', () => ({ getUser: vi.fn() }));
vi.mock('./newrelic', () => ({ noticeError: vi.fn() }));
vi.mock(
  'meteor/idreesia-common/server/graphql-api/workspaces/discussions/access',
  () => ({
    getReaderCommitteeChatGroupId: vi.fn(),
    getWriterCommitteeChatGroupId: vi.fn(),
  })
);

import {
  getReaderCommitteeChatGroupId,
  getWriterCommitteeChatGroupId,
} from 'meteor/idreesia-common/server/graphql-api/workspaces/discussions/access';

import { getUser } from './get-user';
import {
  isRestGuard,
  requireCommitteeDiscussion,
  requireLogin,
  requirePermission,
  type RequestWithChatGroup,
} from './rest-guards';

const getUserMock = getUser as unknown as ReturnType<typeof vi.fn>;
const readerMock = getReaderCommitteeChatGroupId as unknown as ReturnType<
  typeof vi.fn
>;
const writerMock = getWriterCommitteeChatGroupId as unknown as ReturnType<
  typeof vi.fn
>;

const makeReq = (extra: Record<string, unknown> = {}) =>
  ({ headers: { authorization: 'tok' }, params: {}, path: '/x', ...extra }) as unknown as Request;

const makeRes = () => {
  const res = { statusCode: 200, body: undefined as unknown } as Record<string, unknown>;
  res.status = (code: number) => {
    res.statusCode = code;
    return res;
  };
  res.json = (body: unknown) => {
    res.body = body;
    return res;
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
};

const run = async (
  guard: (req: Request, res: Response, next: () => void) => unknown,
  req: Request
) => {
  const res = makeRes();
  const next = vi.fn();
  await guard(req, res, next);
  return { res, next };
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe('guards are tagged for the coverage test', () => {
  it('marks every guard', () => {
    expect(isRestGuard(requireLogin)).toBe(true);
    expect(isRestGuard(requirePermission('p'))).toBe(true);
    expect(isRestGuard(requireCommitteeDiscussion('read'))).toBe(true);
    expect(isRestGuard(() => {})).toBe(false);
  });
});

describe('requireLogin', () => {
  it('answers 401 without a valid login', async () => {
    getUserMock.mockResolvedValue(undefined);
    const { res, next } = await run(requireLogin, makeReq());
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('puts the user on the request and continues', async () => {
    getUserMock.mockResolvedValue({ _id: 'u1' });
    const req = makeReq();
    const { next } = await run(requireLogin, req);
    expect(next).toHaveBeenCalled();
    expect((req as unknown as { user: unknown }).user).toEqual({ _id: 'u1' });
  });

  it('answers 500 rather than throwing when the lookup fails', async () => {
    getUserMock.mockRejectedValue(new Error('db down'));
    const { res, next } = await run(requireLogin, makeReq());
    expect(res.statusCode).toBe(500);
    expect(next).not.toHaveBeenCalled();
  });
});

describe('requirePermission', () => {
  const guard = requirePermission('A', 'B');

  it('answers 401 without a login', async () => {
    getUserMock.mockResolvedValue(undefined);
    expect((await run(guard, makeReq())).res.statusCode).toBe(401);
  });

  it('answers 403 without any of the permissions', async () => {
    getUserMock.mockResolvedValue({ _id: 'u1', permissions: ['C'] });
    const { res, next } = await run(guard, makeReq());
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  it('continues for a user holding one of them', async () => {
    getUserMock.mockResolvedValue({ _id: 'u1', permissions: ['B'] });
    const req = makeReq();
    const { next } = await run(guard, req);
    expect(next).toHaveBeenCalled();
    expect((req as unknown as { user: { _id: string } }).user._id).toBe('u1');
  });
});

describe('requireCommitteeDiscussion', () => {
  const reqFor = (committeeId: string) =>
    makeReq({ params: { committeeId }, user: { _id: 'u1' } });

  it('rejects a malformed committee id with 400', async () => {
    const { res, next } = await run(
      requireCommitteeDiscussion('read'),
      reqFor('../etc')
    );
    expect(res.statusCode).toBe(400);
    expect(next).not.toHaveBeenCalled();
    expect(readerMock).not.toHaveBeenCalled();
  });

  it('answers 401 when no login guard ran before it', async () => {
    const { res, next } = await run(
      requireCommitteeDiscussion('read'),
      makeReq({ params: { committeeId: 'c1' } })
    );
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  it('uses the reader check for read and keeps the chat group', async () => {
    readerMock.mockResolvedValue('chat-1');
    const req = reqFor('c1');
    const { next } = await run(requireCommitteeDiscussion('read'), req);
    expect(readerMock).toHaveBeenCalledWith({ _id: 'u1' }, 'c1');
    expect(writerMock).not.toHaveBeenCalled();
    expect((req as RequestWithChatGroup).chatGroupId).toBe('chat-1');
    expect(next).toHaveBeenCalled();
  });

  it('uses the writer check for write', async () => {
    writerMock.mockResolvedValue('chat-2');
    const req = reqFor('c1');
    await run(requireCommitteeDiscussion('write'), req);
    expect(writerMock).toHaveBeenCalledWith({ _id: 'u1' }, 'c1');
    expect(readerMock).not.toHaveBeenCalled();
    expect((req as RequestWithChatGroup).chatGroupId).toBe('chat-2');
  });

  it.each([
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['BAD_USER_INPUT', 400],
  ])('maps %s to %i', async (code, status) => {
    writerMock.mockRejectedValue(
      new GraphQLError('no', { extensions: { code } })
    );
    const { res, next } = await run(
      requireCommitteeDiscussion('write'),
      reqFor('c1')
    );
    expect(res.statusCode).toBe(status);
    expect(next).not.toHaveBeenCalled();
  });
});
