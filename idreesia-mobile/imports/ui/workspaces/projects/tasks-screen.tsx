import React from 'react';
import { AddOutline } from 'antd-mobile-icons';

import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { TasksList } from './tasks-list';
import { useProjectsInfo } from './use-projects';

/** Workspace → Tasks: the user's tasks, open, overdue and done tasks. */
export const TasksScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const { canManage } = useProjectsInfo(committeeId);
  const listPath = WorkspacesPaths.committeeTasks(committeeId);

  return (
    <Page
      backTo={WorkspacesPaths.root}
      title="Tasks"
      right={
        canManage ? (
          <div className="page-nav-actions">
            <AddOutline
              aria-label="New task"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeNewTask(committeeId), { from: listPath })}
            />
          </div>
        ) : undefined
      }
    >
      <TasksList canCreate={canManage} committeeId={committeeId} from={listPath} />
    </Page>
  );
};
