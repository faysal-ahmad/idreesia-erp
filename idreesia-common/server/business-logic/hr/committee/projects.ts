import { GraphQLError } from 'graphql';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/organization';
import {
  createProjectsWorkspace,
  deleteProjectsWorkspace,
  getProjectsWorkspace,
  listAssigneeTasks,
  listProjects,
  removeProjectParticipant,
  restoreProjectsWorkspace,
  updateTask,
} from 'meteor/idreesia-common/server/business-logic/projects';
import type { ProjectDocument } from 'meteor/idreesia-common/server/collections/projects';

import { archiveProjectChat, removeProjectChatMember, syncProjectChatArchive } from './projects-chat';
import type { CommitteeDoc, CommitteeFeatureHandler } from './types';

// The committee's projects workspace (deleted ones included), or null when
// it no longer exists, e.g. after being purged.
const findProjectsWorkspace = async (workspaceId: string, userId: string) => {
  try {
    return await getProjectsWorkspace(workspaceId, userId, {
      includeDeleted: true,
    });
  } catch (error) {
    const code = (error as GraphQLError).extensions?.code;
    if (code === 'NOT_FOUND') return null;
    throw error;
  }
};

// Recorded as the actor of changes no user made (a member leaving).
const SYSTEM_USER = 'system';

// Every project of a (live) workspace.
const allProjects = async (workspaceId: string, userId: string) => {
  const projects: ProjectDocument[] = [];
  for (let skip = 0; ; skip += 200) {
    const page = await listProjects(workspaceId, userId, { skip, limit: 200 });
    projects.push(...page.data);
    if (!page.data.length || skip + page.data.length >= page.totalResults) {
      break;
    }
  }
  return projects;
};

/**
 * Projects & Tasks: a projects workspace holds the committee's projects and
 * tasks.
 * - Enable restores the committee's previous workspace when it still exists
 *   (with all its projects and tasks, and their chat groups), otherwise
 *   creates a new one.
 * - Disable archives every project's chat group, then soft-deletes the
 *   workspace, keeping everything for a later re-enable.
 * - A member leaving the committee leaves every project: their open tasks are
 *   unassigned, they stop being a participant, and lose chat access.
 */
export const projectsHandler: CommitteeFeatureHandler = {
  async enable(committee, userId) {
    if (committee.projectsWorkspaceId) {
      const existing = await findProjectsWorkspace(
        committee.projectsWorkspaceId,
        userId
      );
      if (existing) {
        if (existing.deletedAt) {
          await restoreProjectsWorkspace(existing._id, userId);
        }
        // Open projects get their chat back; closed ones stay archived.
        for (const project of await allProjects(existing._id, userId)) {
          await syncProjectChatArchive(project);
        }
        return { projectsWorkspaceId: existing._id };
      }
    }

    const workspace = await createProjectsWorkspace(
      {
        name: `${committee.name} Projects`,
        metadata: { committeeId: committee._id },
      },
      userId
    );
    return { projectsWorkspaceId: workspace._id };
  },

  async disable(committee, userId) {
    if (!committee.projectsWorkspaceId) return;
    const existing = await findProjectsWorkspace(
      committee.projectsWorkspaceId,
      userId
    );
    if (existing && !existing.deletedAt) {
      for (const project of await allProjects(existing._id, userId)) {
        await archiveProjectChat(project);
      }
      await deleteProjectsWorkspace(existing._id, userId);
    }
  },

  // Called before the member is removed from the committee.
  async memberRemoved(committee, karkunId) {
    if (!committee.projectsWorkspaceId) return;
    const workspaceId = committee.projectsWorkspaceId;

    // Each pass removes the person from the projects it lists, so the next
    // listing is shorter; the loop ends when none are left.
    for (;;) {
      const projects = await listProjects(workspaceId, SYSTEM_USER, {
        participantId: karkunId,
        limit: 200,
      });
      if (!projects.data.length) break;
      for (const project of projects.data) {
        await removeProjectChatMember(project, karkunId);
        await removeProjectParticipant(project._id, karkunId, SYSTEM_USER, {
          unassignTasks: true,
        });
      }
    }

    // Open tasks still assigned to them (standalone ones).
    for (;;) {
      const tasks = await listAssigneeTasks(karkunId, SYSTEM_USER, {
        workspaceIds: [workspaceId],
        limit: 200,
      });
      if (!tasks.data.length) break;
      for (const task of tasks.data) {
        await updateTask(task._id, { assigneeId: null }, SYSTEM_USER);
      }
    }
  },
};

/**
 * The projects workspace behind a committee's projects. Throws when the
 * committee doesn't have Projects enabled.
 */
export const getCommitteeProjectsWorkspaceId = (
  committee: CommitteeDoc
): string => {
  const enabled = committee.features?.includes(CommitteeFeatureKeys.PROJECTS);
  if (!enabled || !committee.projectsWorkspaceId) {
    throw new GraphQLError('Projects are not enabled for this committee.', {
      extensions: { code: 'NOT_FOUND' },
    });
  }
  return committee.projectsWorkspaceId;
};
