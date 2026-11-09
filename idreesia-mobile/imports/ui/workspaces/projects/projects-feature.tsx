import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { DiscussionRoutes } from '../discussions/discussion-feature';
import { useProjectDiscussionScope } from '../discussions/discussion-scope';
import { type ProjectPart, WorkspacesPaths } from '../paths';
import { ProjectActivityScreen } from './project-activity-screen';
import { ProjectFormScreen } from './project-form-screen';
import { ProjectParticipantsScreen } from './project-participants-screen';
import { ProjectScreen } from './project-screen';
import { ProjectTasksScreen } from './project-tasks-screen';
import { ProjectsScreen } from './projects-screen';
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
 * Workspace → Projects. Owns every route under the projects path. The list
 * stays mounted (KeepAlive) under an opened project, and the project under
 * the screens for its parts and its chat, so back returns to each as it was.
 */
export const ProjectsFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeProjectsPattern, exact: true }));
  const onNew = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeNewProjectPattern, exact: true }));
  const projectMatch = onNew
    ? null
    : matchPath<{ projectId: string }>(pathname, { path: WorkspacesPaths.committeeProjectPattern });

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
      <Switch>
        <Route exact path={WorkspacesPaths.committeeProjectsPattern} render={() => null} />
        <Route exact component={ProjectFormScreen} path={WorkspacesPaths.committeeNewProjectPattern} />
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
