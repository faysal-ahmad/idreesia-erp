import { Migrations } from 'meteor/quave:migrations';

import {
  MeetingActionItems,
  MeetingAttachments,
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';

Migrations.add({
  version: 61,
  async up() {
    const meetings = Meetings.rawCollection();
    await meetings.createIndex(
      { workspaceId: 1, startsAt: 1 },
      { background: true }
    );
    await meetings.createIndex(
      { workspaceId: 1, status: 1, startsAt: 1 },
      { background: true }
    );
    // "My meetings" across workspaces.
    await meetings.createIndex(
      { 'participants.participantId': 1, startsAt: 1 },
      { background: true }
    );
    // Searches always name the workspace, so it prefixes the text index.
    await meetings.createIndex(
      { workspaceId: 1, title: 'text', description: 'text', tags: 'text' },
      {
        name: 'meetings_text',
        weights: { title: 10, tags: 5, description: 1 },
        // Titles mix languages; don't apply English stemming or stop words.
        default_language: 'none',
        background: true,
      }
    );

    const attachments = MeetingAttachments.rawCollection();
    await attachments.createIndex(
      { meetingId: 1, createdAt: 1 },
      { background: true }
    );
    await attachments.createIndex({ workspaceId: 1 }, { background: true });
    await attachments.createIndex(
      { status: 1, uploadExpiresAt: 1 },
      { background: true }
    );

    const actionItems = MeetingActionItems.rawCollection();
    await actionItems.createIndex(
      { workspaceId: 1, status: 1, dueDate: 1 },
      { background: true }
    );
    await actionItems.createIndex({ meetingId: 1 }, { background: true });
    await actionItems.createIndex(
      { assigneeId: 1, status: 1 },
      { sparse: true, background: true }
    );

    const activities = MeetingsActivities.rawCollection();
    await activities.createIndex(
      { workspaceId: 1, at: -1 },
      { background: true }
    );
    await activities.createIndex(
      { meetingId: 1, at: -1 },
      { sparse: true, background: true }
    );
  },
});
