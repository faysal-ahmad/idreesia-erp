import { describe, expect, it } from 'vitest';

import {
  buildMemberNotification,
  MemberEvent,
} from './members-notifications';

const base = {
  committee: { _id: 'c1', name: 'Finance' },
  karkunId: 'k1',
  karkunName: 'Ali',
  actorUserId: 'actor',
  now: new Date('2026-06-01T12:00:00Z'),
};

describe('buildMemberNotification', () => {
  it('belongs to the committee and has no workspace', () => {
    const n = buildMemberNotification({
      ...base,
      event: MemberEvent.ADDED,
      recipientUserId: 'u1',
    });
    expect(n.committeeId).toBe('c1');
    expect(n).not.toHaveProperty('workspaceId');
    expect(n.recipientUserId).toBe('u1');
    expect(n.actorUserId).toBe('actor');
    expect(n.eventDetails).toBe('Ali was added to the Finance committee.');
  });

  it('names the affected person for every recipient', () => {
    const n = buildMemberNotification({
      ...base,
      event: MemberEvent.COORDINATOR_ASSIGNED,
      recipientUserId: 'u2',
    });
    expect(n.eventDetails).toBe('Ali is now a coordinator of the Finance committee.');
  });

  it('gives each recipient and each occurrence its own id', () => {
    const a = buildMemberNotification({ ...base, event: MemberEvent.REMOVED, recipientUserId: 'u1' });
    const b = buildMemberNotification({ ...base, event: MemberEvent.REMOVED, recipientUserId: 'u2' });
    const later = buildMemberNotification({ ...base, event: MemberEvent.REMOVED, recipientUserId: 'u1', now: new Date('2026-06-02T12:00:00Z') });
    expect(new Set([a.id, b.id, later.id]).size).toBe(3);
  });
});
