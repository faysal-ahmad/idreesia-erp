import React from 'react';

import { KeepAlive } from '../../layout';
import { matchPath, Redirect, Route, Switch, useLocation, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { TaskFormScreen } from './task-form-screen';
import { TaskScreen } from './task-screen';
import { TasksScreen } from './tasks-screen';

/**
 * Workspace → Tasks. Owns every route under the tasks path. The list stays
 * mounted (KeepAlive) under an opened task. A task opened from a project
 * (or anywhere else) returns there: its back arrow follows the `from` the
 * opening screen passed.
 */
export const TasksFeature = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const { pathname } = useLocation();
  const onList = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeTasksPattern, exact: true }));
  const onNew = Boolean(matchPath(pathname, { path: WorkspacesPaths.committeeNewTaskPattern, exact: true }));
  const taskMatch = onNew
    ? null
    : matchPath<{ taskId: string }>(pathname, { path: WorkspacesPaths.committeeTaskPattern });

  return (
    <>
      <KeepAlive active={onList}>
        <TasksScreen />
      </KeepAlive>
      {taskMatch && (
        <KeepAlive key={taskMatch.params.taskId} active={taskMatch.isExact}>
          <TaskScreen taskId={taskMatch.params.taskId} />
        </KeepAlive>
      )}
      <Switch>
        <Route exact path={WorkspacesPaths.committeeTasksPattern} render={() => null} />
        <Route exact component={TaskFormScreen} path={WorkspacesPaths.committeeNewTaskPattern} />
        <Route exact path={WorkspacesPaths.committeeTaskPattern} render={() => null} />
        <Route exact component={TaskFormScreen} path={WorkspacesPaths.committeeTaskEditPattern} />
        <Redirect to={WorkspacesPaths.committeeTasks(committeeId)} />
      </Switch>
    </>
  );
};
