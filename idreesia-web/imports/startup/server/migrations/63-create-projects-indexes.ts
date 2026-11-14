import { Migrations } from 'meteor/quave:migrations';

import {
  ProjectComments,
  Projects,
  ProjectsActivities,
  ProjectTasks,
} from 'meteor/idreesia-common/server/collections/projects';

Migrations.add({
  version: 63,
  async up() {
    const projects = Projects.rawCollection();
    await projects.createIndex(
      { workspaceId: 1, status: 1, createdAt: -1 },
      { background: true }
    );
    // "Projects I take part in" across workspaces.
    await projects.createIndex(
      { participantIds: 1, status: 1 },
      { background: true }
    );
    // Searches always name the workspace, so it prefixes the text index.
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
        // Titles mix languages; don't apply English stemming or stop words.
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
    await activities.createIndex(
      { workspaceId: 1, at: -1 },
      { background: true }
    );
    await activities.createIndex(
      { projectId: 1, at: -1 },
      { sparse: true, background: true }
    );
    await activities.createIndex(
      { taskId: 1, at: -1 },
      { sparse: true, background: true }
    );
  },
});
