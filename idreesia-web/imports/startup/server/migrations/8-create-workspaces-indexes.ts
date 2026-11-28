import { Migrations } from 'meteor/quave:migrations';

import {
  DmsActivities,
  DmsDocuments,
  DmsDocumentVersions,
  DmsFolders,
} from 'meteor/idreesia-common/server/collections/dms';
import {
  MeetingActionItems,
  MeetingAttachments,
  Meetings,
  MeetingsActivities,
} from 'meteor/idreesia-common/server/collections/meetings';
import {
  PollBallots,
  Polls,
  PollsActivities,
} from 'meteor/idreesia-common/server/collections/polls';
import {
  ProjectComments,
  Projects,
  ProjectsActivities,
  ProjectTasks,
} from 'meteor/idreesia-common/server/collections/projects';

// Workspace searches always name the workspace, so it prefixes each text
// index. Names and titles mix languages, so the text indexes apply no English
// stemming or stop words.

async function createDmsIndexes() {
  // Names are unique (case-insensitively) among the live items of a folder;
  // trashed items don't count. A missing parentId/folderId is the root.
  const folders = DmsFolders.rawCollection();
  await folders.createIndex(
    { workspaceId: 1, parentId: 1, nameLower: 1 },
    {
      unique: true,
      partialFilterExpression: { trashed: false },
      background: true,
    }
  );
  await folders.createIndex({ ancestorIds: 1 }, { background: true });
  await folders.createIndex({ trashRootId: 1 }, { sparse: true, background: true });

  const documents = DmsDocuments.rawCollection();
  await documents.createIndex(
    { workspaceId: 1, folderId: 1, nameLower: 1 },
    {
      unique: true,
      partialFilterExpression: { trashed: false },
      background: true,
    }
  );
  await documents.createIndex(
    { workspaceId: 1, trashed: 1, updatedAt: -1 },
    { background: true }
  );
  await documents.createIndex({ workspaceId: 1, tags: 1 }, { background: true });
  await documents.createIndex({ trashRootId: 1 }, { sparse: true, background: true });
  await documents.createIndex(
    { workspaceId: 1, name: 'text', description: 'text', tags: 'text' },
    {
      name: 'dms_documents_text',
      weights: { name: 10, tags: 5, description: 1 },
      default_language: 'none',
      background: true,
    }
  );

  const versions = DmsDocumentVersions.rawCollection();
  await versions.createIndex(
    { documentId: 1, versionNumber: 1 },
    {
      unique: true,
      partialFilterExpression: { status: 'ready' },
      background: true,
    }
  );
  await versions.createIndex({ workspaceId: 1 }, { background: true });
  await versions.createIndex({ status: 1, uploadExpiresAt: 1 }, { background: true });

  const activities = DmsActivities.rawCollection();
  await activities.createIndex({ workspaceId: 1, at: -1 }, { background: true });
  await activities.createIndex(
    { documentId: 1, at: -1 },
    { sparse: true, background: true }
  );
}

async function createMeetingsIndexes() {
  const meetings = Meetings.rawCollection();
  await meetings.createIndex({ workspaceId: 1, startsAt: 1 }, { background: true });
  await meetings.createIndex(
    { workspaceId: 1, status: 1, startsAt: 1 },
    { background: true }
  );
  // "My meetings" across workspaces.
  await meetings.createIndex(
    { 'participants.participantId': 1, startsAt: 1 },
    { background: true }
  );
  await meetings.createIndex(
    { workspaceId: 1, title: 'text', description: 'text', tags: 'text' },
    {
      name: 'meetings_text',
      weights: { title: 10, tags: 5, description: 1 },
      default_language: 'none',
      background: true,
    }
  );

  const attachments = MeetingAttachments.rawCollection();
  await attachments.createIndex({ meetingId: 1, createdAt: 1 }, { background: true });
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
  await activities.createIndex({ workspaceId: 1, at: -1 }, { background: true });
  await activities.createIndex(
    { meetingId: 1, at: -1 },
    { sparse: true, background: true }
  );
}

async function createPollsIndexes() {
  const polls = Polls.rawCollection();
  await polls.createIndex(
    { workspaceId: 1, status: 1, closesAt: 1 },
    { background: true }
  );
  await polls.createIndex({ workspaceId: 1, createdAt: -1 }, { background: true });
  // Closing open polls whose end time has passed.
  await polls.createIndex({ status: 1, closesAt: 1 }, { background: true });
  // "Polls I can vote in" across workspaces.
  await polls.createIndex({ eligibleVoterIds: 1, closesAt: 1 }, { background: true });
  await polls.createIndex(
    { workspaceId: 1, title: 'text', description: 'text', tags: 'text' },
    {
      name: 'polls_text',
      weights: { title: 10, tags: 5, description: 1 },
      default_language: 'none',
      background: true,
    }
  );

  const ballots = PollBallots.rawCollection();
  // One ballot per voter per poll.
  await ballots.createIndex({ pollId: 1, voterId: 1 }, { unique: true, background: true });
  await ballots.createIndex({ voterId: 1, pollId: 1 }, { background: true });
  await ballots.createIndex({ workspaceId: 1 }, { background: true });

  const activities = PollsActivities.rawCollection();
  await activities.createIndex({ workspaceId: 1, at: -1 }, { background: true });
  await activities.createIndex({ pollId: 1, at: -1 }, { sparse: true, background: true });
}

async function createProjectsIndexes() {
  const projects = Projects.rawCollection();
  await projects.createIndex(
    { workspaceId: 1, status: 1, createdAt: -1 },
    { background: true }
  );
  // "Projects I take part in" across workspaces.
  await projects.createIndex({ participantIds: 1, status: 1 }, { background: true });
  await projects.createIndex(
    {
      workspaceId: 1,
      title: 'text',
      objective: 'text',
      description: 'text',
      tags: 'text',
    },
    {
      name: 'projects_text',
      weights: { title: 10, tags: 5, objective: 3, description: 1 },
      default_language: 'none',
      background: true,
    }
  );

  const tasks = ProjectTasks.rawCollection();
  await tasks.createIndex(
    { workspaceId: 1, status: 1, dueDate: 1 },
    { background: true }
  );
  await tasks.createIndex(
    { workspaceId: 1, projectId: 1, status: 1 },
    { background: true }
  );
  // Project statistics and "tasks of a project".
  await tasks.createIndex({ projectId: 1, status: 1 }, { sparse: true, background: true });
  // "My tasks" across workspaces.
  await tasks.createIndex(
    { assigneeId: 1, status: 1, dueDate: 1 },
    { sparse: true, background: true }
  );
  await tasks.createIndex(
    { workspaceId: 1, title: 'text', description: 'text', tags: 'text' },
    {
      name: 'project_tasks_text',
      weights: { title: 10, tags: 5, description: 1 },
      default_language: 'none',
      background: true,
    }
  );

  const comments = ProjectComments.rawCollection();
  await comments.createIndex({ taskId: 1, createdAt: 1 }, { background: true });
  await comments.createIndex({ workspaceId: 1 }, { background: true });

  const activities = ProjectsActivities.rawCollection();
  await activities.createIndex({ workspaceId: 1, at: -1 }, { background: true });
  await activities.createIndex(
    { projectId: 1, at: -1 },
    { sparse: true, background: true }
  );
  await activities.createIndex({ taskId: 1, at: -1 }, { sparse: true, background: true });
}

Migrations.add({
  version: 8,
  name: 'Create workspaces indexes',
  async up() {
    await createDmsIndexes();
    await createMeetingsIndexes();
    await createPollsIndexes();
    await createProjectsIndexes();
  },
});
