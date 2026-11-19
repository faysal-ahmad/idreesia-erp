import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  MeetingActionItems,
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';

import { createActionItem, createMeeting, createMeetingsWorkspace } from './index';

// An action item and the meeting's open action item count are one
// transaction.

const HOUR = 60 * 60 * 1000;

let workspaceId: string;

beforeEach(async () => {
  workspaceId = (await createMeetingsWorkspace({ name: 'W' }, 'u1'))._id;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('meetings transactions', () => {
  it('keeps no action item and the open count when the item cannot be logged', async () => {
    const startsAt = new Date(Date.now() + 24 * HOUR);
    const meeting = await createMeeting(
      {
        workspaceId,
        title: 'Board meeting',
        startsAt,
        endsAt: new Date(startsAt.getTime() + HOUR),
        participants: [],
      },
      'u1'
    );
    vi.spyOn(MeetingsActivities, 'insertAsync').mockRejectedValueOnce(
      new Error('activity log failed')
    );

    await expect(
      createActionItem({ meetingId: meeting._id, title: 'Book the hall' }, 'u1')
    ).rejects.toThrow('activity log failed');

    expect(await MeetingActionItems.find({}).countAsync()).toBe(0);
    expect(
      (await Meetings.findOneAsync(meeting._id))?.openActionItemCount ?? 0
    ).toBe(0);
  });
});
