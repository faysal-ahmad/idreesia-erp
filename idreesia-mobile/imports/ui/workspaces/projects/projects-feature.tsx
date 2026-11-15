import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { DiscussionRoutes } from '../discussions/discussion-feature';
import { useProjectDiscussionScope } from '../discussions/discussion-scope';
import { type ProjectPart, WorkspacesPaths } from '../paths';
import { ProjectActivityScreen } from './project-activity-screen';
import { ProjectFormScreen } from './project-form-screen';
import { ProjectNotificationsScreen } from './project-notifications-screen';
import { ProjectParticipantsScreen } from './project-participants-screen';
import { ProjectScreen } from './project-screen';
import { ProjectTasksScreen } from './project-tasks-screen';
import { ProjectsScreen } from './projects-screen';
import { TaskFormScreen } from './task-form-screen';
import { TaskScreen } from './task-screen';
import { useProject } from './use-projects';

const PART_SCREENS: Array<[ProjectPart, React.ComponentType]> = [
  ['edit', ProjectFormScreen],
  ['participants', ProjectParticipantsScreen],
  ['tasks', ProjectTasksScreen],
  ['activity', ProjectActivityScreen],
];

/** A project's private chat: the discussion screens, titled with the project. */
const ProjectChat = () => {
  const { committeeId, projectId } = useParams<{ committeeId: string; projectId: string }>();
  const scope = useProjectDiscussionScope(committeeId, projectId);
  const { project } = useProject(committeeId, projectId);
  return <DiscussionRoutes scope={scope} title={project?.title ? `${project.title} chat` : null} />;
};

/**
 * Workspace → Projects & Tasks. Owns every route under the projects path,
 * tasks included. The list (both its tabs) stays mounted (KeepAlive) under
 * an opened project or task, and the project under the screens for its parts
 * and its chat, so back returns to each as it was. A task opened from a
 * project (or anywhere else) returns there: its back arrow follows the
 * `from` the opening screen passed.
 */
export const ProjectsFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeProjectsPattern, exact: true }));
  const onNew = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeNewProjectPattern, exact: true }));
  const onNotifications = Boolean(
    matchPath(pathname, { path: WorkspacesPaths.committeeProjectNotificationsPattern, exact: true }),
  );
  const onTasks = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeTasksBasePattern }));
  const onNewTask = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeNewTaskPattern, exact: true }));
  const projectMatch = onNew || onNotifications || onTasks
    ? null
    : matchPath<{ projectId: string }>(pathname, { path: WorkspacesPaths.committeeProjectPattern });
  const taskMatch = onNewTask
    ? null
    : matchPath<{ taskId: string }>(pathname, { path: WorkspacesPaths.committeeTaskPattern });

  return (
    <>
      <KeepAlive active={onList}>
        <ProjectsScreen />
      </KeepAlive>
      {projectMatch && (
        <KeepAlive key={projectMatch.params.projectId} active={projectMatch.isExact}>
          <ProjectScreen projectId={projectMatch.params.projectId} />
        </KeepAlive>
      )}
      {taskMatch && (
        <KeepAlive key={taskMatch.params.taskId} active={taskMatch.isExact}>
          <TaskScreen taskId={taskMatch.params.taskId} />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={WorkspacesPaths.committeeProjectsPattern} render={() => null} />
        <Route exact component={TaskFormScreen} path={WorkspacesPaths.committeeNewTaskPattern} />
        <Route exact path={WorkspacesPaths.committeeTaskPattern} render={() => null} />
        <Route exact component={TaskFormScreen} path={WorkspacesPaths.committeeTaskEditPattern} />
        <Route exact component={ProjectFormScreen} path={WorkspacesPaths.committeeNewProjectPattern} />
        <Route
          exact
          component={ProjectNotificationsScreen}
          path={WorkspacesPaths.committeeProjectNotificationsPattern}
        />
        <Route exact path={WorkspacesPaths.committeeProjectPattern} render={() => null} />
        {PART_SCREENS.map(([part, component]) => (
          <Route
            key={part}
            exact
            component={component}
            path={WorkspacesPaths.committeeProjectPartPattern(part)}
          />
        ))}
        <Route component={ProjectChat} path={WorkspacesPaths.committeeProjectChatPattern} />
        <Redirect to={WorkspacesPaths.committeeProjects(committeeId)} />
      </Switch>
    </>
  );
};
