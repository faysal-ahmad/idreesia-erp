import { describe, expect, it, vi } from 'vitest';

import { Committees } from 'meteor/idreesia-common/server/collections/hr';
import {
  makeLockedUser,
  makeSuperAdmin,
  makeUser,
} from 'meteor/idreesia-common/server/test-utils/fixtures';

// The chat group lookup talks to the chat service; the access decision is what
// is under test.
vi.mock('meteor/idreesia-common/server/business-logic/hr/committee', () => ({
  getCommitteeChatGroupId: vi.fn(async (c: { _id: string }) => `chat-${c._id}`),
}));

import { getReaderCommitteeChatGroupId } from './access';

const seed = async (members: Array<{ karkunId: string; role?: string }>) => {
  await Committees.insertAsync({ _id: 'c1', name: 'C', members } as never);
};

const as = (personId: string | undefined, extra = {}) =>
  makeUser({ personId, ...extra });

const code = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 'ok';
  } catch (e) {
    return (e as { extensions?: { code?: string } }).extensions?.code ?? 'error';
  }
};

describe('getReaderCommitteeChatGroupId (the discussion file routes)', () => {
  it('lets coordinators, members, role-less members and observers read', async () => {
    await seed([
      { karkunId: 'p1', role: 'coordinator' },
      { karkunId: 'p2', role: 'member' },
      { karkunId: 'p3' },
      { karkunId: 'p4', role: 'observer' },
    ]);
    for (const p of ['p1', 'p2', 'p3', 'p4']) {
      expect(await getReaderCommitteeChatGroupId(as(p), 'c1')).toBe('chat-c1');
    }
  });

  it('refuses a guest: guests are not part of the discussion', async () => {
    await seed([{ karkunId: 'p1', role: 'guest' }]);
    expect(await code(getReaderCommitteeChatGroupId(as('p1'), 'c1'))).toBe('FORBIDDEN');
  });

  it('refuses a non-member, an unknown committee, and no user', async () => {
    await seed([{ karkunId: 'p1', role: 'member' }]);
    expect(await code(getReaderCommitteeChatGroupId(as('other'), 'c1'))).toBe('FORBIDDEN');
    expect(await code(getReaderCommitteeChatGroupId(as('p1'), 'missing'))).toBe('FORBIDDEN');
    expect(await code(getReaderCommitteeChatGroupId(undefined, 'c1'))).toBe('FORBIDDEN');
  });

  it('refuses a locked member and a user without a person record', async () => {
    await seed([{ karkunId: 'p1', role: 'coordinator' }]);
    expect(await code(getReaderCommitteeChatGroupId(makeLockedUser({ personId: 'p1' }), 'c1'))).toBe('FORBIDDEN');
    expect(await code(getReaderCommitteeChatGroupId(as(undefined), 'c1'))).toBe('FORBIDDEN');
  });

  it('treats a super-admin as a coordinator, a locked one as nobody', async () => {
    await seed([]);
    expect(await getReaderCommitteeChatGroupId(makeSuperAdmin(), 'c1')).toBe('chat-c1');
    expect(await code(getReaderCommitteeChatGroupId(makeSuperAdmin({ locked: true }), 'c1'))).toBe('FORBIDDEN');
  });
});
