import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { Badge, List, ProgressBar, Tabs, Tag } from 'antd-mobile';
import { AddOutline, BellOutline, UnorderedListOutline } from 'antd-mobile-icons';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
import { MOBILE_MY_NOTIFICATION_COUNTS } from '../gql';
import { WorkspacesPaths } from '../paths';
import { formatDay, projectStatus, toDate } from './format';
import { MOBILE_WORKSPACE_PROJECTS } from './gql';
import { useProjectsInfo } from './use-projects';

type View = 'active' | 'completed' | 'mine' | 'all';

const EMPTY_TITLES: Record<View, string> = {
  active: 'No active projects',
  completed: 'No completed projects',
  mine: "You aren't in any open project",
  all: 'No projects yet',
};

/** Workspace → Projects: active, completed and the user's own projects. */
export const ProjectsScreen = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const [view, setView] = useState<View>('active');
  const { canManage } = useProjectsInfo(committeeId);
  // Unread project and task notifications, for the bell. Best effort.
  // cache-and-network so the count updates after reading them (this list
  // stays mounted).
  const { data: countData } = useQuery(MOBILE_MY_NOTIFICATION_COUNTS, {
    fetchPolicy: 'cache-and-network',
  });
  const unreadCount = (countData?.myNotificationCounts ?? [])
    .filter(row => row?.committeeId === committeeId && row.module === 'projects')
    .reduce((total, row) => total + (row?.unreadCount ?? 0), 0);

  const paged = usePagedQuery(MOBILE_WORKSPACE_PROJECTS, {
    filter: { committeeId, view },
    toVariables: (filter, { pageIndex, pageSize }) => ({
      ...filter,
      pageIndex: Number(pageIndex),
      pageSize: Number(pageSize),
    }),
    getPage: data => data.workspaceProjects,
    getKey: project => project._id,
  });

  return (
    <Page
      backTo={WorkspacesPaths.root}
      title="Projects"
      right={
        <div className="page-nav-actions">
          <Badge content={unreadCount > 0 ? unreadCount : null}>
            <BellOutline
              aria-label="Notifications"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeProjectNotifications(committeeId))}
            />
          </Badge>
          {canManage && (
            <AddOutline
              aria-label="New project"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeNewProject(committeeId))}
            />
          )}
        </div>
      }
    >
      <Tabs activeKey={view} className="projects-tabs" onChange={key => setView(key as View)}>
        <Tabs.Tab key="active" title="Active" />
        <Tabs.Tab key="mine" title="Mine" />
        <Tabs.Tab key="completed" title="Completed" />
        <Tabs.Tab key="all" title="All" />
      </Tabs>

      <PagedList
        emptyTitle={EMPTY_TITLES[view]}
        getKey={project => project._id ?? ''}
        itemsLabel="projects"
        paged={paged}
        emptyDescription={view === 'active' && canManage ? 'Tap + to create a project.' : undefined}
        renderItem={project => {
          const status = projectStatus(project.status);
          const target = toDate(project.targetDate);
          return (
            <List.Item
              description={
                <>
                  <ProgressBar className="project-row-progress" percent={project.progress ?? 0} />
                  <div className={project.isOverdue ? 'project-overdue-text' : undefined}>
                    {project.doneCount ?? 0} of {project.taskCount ?? 0} tasks done
                    {target ? ` · Target ${formatDay(target)}` : ''}
                  </div>
                </>
              }
              extra={
                <div className="project-list-tags">
                  <Tag color={status.color} fill="outline">
                    {status.label}
                  </Tag>
                  {project.isOverdue && (
                    <Tag color="danger" fill="outline">
                      Overdue
                    </Tag>
                  )}
                </div>
              }
              prefix={
                <span className="list-icon">
                  <UnorderedListOutline />
                </span>
              }
              onClick={() => project._id && history.push(WorkspacesPaths.committeeProject(committeeId, project._id))}
            >
              {project.title}
            </List.Item>
          );
        }}
      />
    </Page>
  );
};
