import React, { useState } from 'react';
import { List, ProgressBar, Tabs, Tag } from 'antd-mobile';
import { AddOutline, UnorderedListOutline } from 'antd-mobile-icons';

import { PagedList } from '../../components';
import { usePagedQuery } from '../../hooks';
import { Page } from '../../layout';
import { useHistory, useParams } from '../../router';
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
        canManage ? (
          <div className="page-nav-actions">
            <AddOutline
              aria-label="New project"
              className="page-nav-action"
              onClick={() => history.push(WorkspacesPaths.committeeNewProject(committeeId))}
            />
          </div>
        ) : undefined
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
