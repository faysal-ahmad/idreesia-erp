import React, { useState } from 'react';
import { List, Tabs, Tag } from 'antd-mobile';
import { CheckCircleOutline } from 'antd-mobile-icons';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { useHistory } from '../../router';
import { WorkspacesPaths } from '../paths';
import { describeDue, taskPriority, taskStatus } from './format';
import { MOBILE_WORKSPACE_TASKS } from './gql';

export type TasksView = 'mine' | 'open' | 'overdue' | 'done';

const EMPTY_TITLES: Record<TasksView, string> = {
  mine: 'No tasks assigned to you',
  open: 'No open tasks',
  overdue: 'No overdue tasks',
  done: 'No finished tasks',
};

interface Props {
  committeeId: string;
  /** Only this project's tasks (the tasks screen of a project). */
  projectId?: string;
  /** Where a task's back arrow returns to, e.g. the project the list is under. */
  from: string;
  /** Tap + to ...: shown when the list is empty and the user can create tasks. */
  canCreate?: boolean;
}

/**
 * Tabbed, paged list of tasks (My tasks / Open / Overdue / Done). Overdue
 * tasks are highlighted. Tapping a task opens it, remembering `from` so its
 * back arrow returns here.
 */
export const TasksList = ({ committeeId, projectId, from, canCreate }: Props) => {
  const history = useHistory();
  const [view, setView] = useState<TasksView>(projectId ? 'open' : 'mine');

  const paged = usePagedQuery(MOBILE_WORKSPACE_TASKS, {
    filter: { committeeId, view, projectId: projectId ?? null },
    toVariables: (filter, { pageIndex, pageSize }) => ({
      ...filter,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    }),
    getPage: data => data.workspaceTasks,
    getKey: task => task._id,
  });

  return (
    <>
      <Tabs activeKey={view} className="projects-tabs" onChange={key => setView(key as TasksView)}>
        <Tabs.Tab key="mine" title="Mine" />
        <Tabs.Tab key="open" title="Open" />
        <Tabs.Tab key="overdue" title="Overdue" />
        <Tabs.Tab key="done" title="Done" />
      </Tabs>

      <PagedList
        emptyTitle={EMPTY_TITLES[view]}
        getKey={task => task._id ?? ''}
        itemsLabel="tasks"
        paged={paged}
        emptyDescription={view === 'open' && canCreate ? 'Tap + to create a task.' : undefined}
        renderItem={task => {
          const status = taskStatus(task.status);
          const priority = taskPriority(task.priority);
          const showPriority = task.priority === 'high' || task.priority === 'urgent';
          return (
            <List.Item
              description={
                <>
                  <div className={task.isOverdue ? 'project-overdue-text' : undefined}>{describeDue(task)}</div>
                  <div>
                    {[task.assigneeName ?? 'Unassigned', !projectId ? task.projectTitle : null, `${task.progress ?? 0}%`]
                      .filter(Boolean)
                      .join(' · ')}
                  </div>
                </>
              }
              extra={
                <div className="project-list-tags">
                  <Tag color={status.color} fill="outline">
                    {status.label}
                  </Tag>
                  {showPriority && (
                    <Tag color={priority.color} fill="outline">
                      {priority.label}
                    </Tag>
                  )}
                </div>
              }
              prefix={
                <span className="list-icon">
                  <CheckCircleOutline />
                </span>
              }
              onClick={() => {
                if (task._id) history.push(WorkspacesPaths.committeeTask(committeeId, task._id), { from });
              }}
            >
              {task.title}
            </List.Item>
          );
        }}
      />
    </>
  );
};
