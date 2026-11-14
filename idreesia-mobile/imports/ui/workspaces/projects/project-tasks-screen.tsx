import React from 'react';
import { AddOutline } from 'antd-mobile-icons';

import { useHistory } from '../../router';
import { WorkspacesPaths } from '../paths';
import { isProjectOpen } from './format';
import { ProjectPartPage, useProjectPart } from './project-part';
import { TasksList } from './tasks-list';

/** A project's tasks: the same tabs as the Tasks screen, for this project only. */
export const ProjectTasksScreen = () => {
  const part = useProjectPart();
  const { committeeId, projectId, project } = part;
  const history = useHistory();
  const canAdd = !!project?.canManage && isProjectOpen(project.status);
  const from = WorkspacesPaths.committeeProjectPart(committeeId, projectId, 'tasks');

  return (
    <ProjectPartPage
      part={part}
      title="Tasks"
      right={
        canAdd ? (
          <div className="page-nav-actions">
            <AddOutline
              aria-label="New task"
              className="page-nav-action"
              onClick={() =>
                history.push(`${WorkspacesPaths.committeeNewTask(committeeId)}?projectId=${projectId}`, { from })
              }
            />
          </div>
        ) : undefined
      }
    >
      {() => <TasksList canCreate={canAdd} committeeId={committeeId} from={from} projectId={projectId} />}
    </ProjectPartPage>
  );
};
