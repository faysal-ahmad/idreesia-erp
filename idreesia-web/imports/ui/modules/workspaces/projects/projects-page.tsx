import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Tabs } from 'antd';

import { ProjectsBoard } from '/imports/ui/modules/common/projects';

import { default as paths } from '../submodule-paths';
import { useCommitteeProjectsProvider } from './use-committee-projects-provider';
import TasksPage from './tasks-page';

const TAB_PARAM = 'section';

// A committee's projects and tasks: two sections of the reusable projects UI
// with a committee data provider.
const ProjectsPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const location = useLocation();
  const provider = useCommitteeProjectsProvider(committeeId);
  const section =
    new URLSearchParams(location.search).get(TAB_PARAM) === 'tasks'
      ? 'tasks'
      : 'projects';

  const setSection = (key: string) => {
    history.replace({
      pathname: location.pathname,
      search: key === 'tasks' ? `?${TAB_PARAM}=tasks` : '',
    });
  };

  return (
    <Tabs
      activeKey={section}
      onChange={setSection}
      destroyOnHidden
      items={[
        {
          key: 'projects',
          label: 'Projects',
          children: (
            <ProjectsBoard
              key={committeeId}
              provider={provider}
              onOpenProject={projectId =>
                history.push({
                  pathname: paths.committeeProjectPath(committeeId, projectId),
                  // So Back returns to the same list view.
                  state: { listSearch: location.search },
                })
              }
            />
          ),
        },
        {
          key: 'tasks',
          label: 'Tasks',
          children: <TasksPage key={committeeId} />,
        },
      ]}
    />
  );
};

export default ProjectsPage;
