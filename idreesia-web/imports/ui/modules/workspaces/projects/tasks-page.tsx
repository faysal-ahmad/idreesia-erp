import React, { useEffect, useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { Empty, Flex, Spin } from 'antd';

import {
  TasksBoard,
  type ProjectMember,
  type ProjectsInfo,
} from '/imports/ui/modules/common/projects';

import { default as paths } from '../submodule-paths';
import { useCommitteeProjectsProvider } from './use-committee-projects-provider';

// A committee's tasks, standalone and in projects.
const TasksPage = () => {
  const { committeeId } = useParams<{ committeeId: string }>();
  const history = useHistory();
  const location = useLocation();
  const provider = useCommitteeProjectsProvider(committeeId);
  const [info, setInfo] = useState<ProjectsInfo | null>(null);
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([provider.getInfo(), provider.loadMembers()])
      .then(([loadedInfo, loadedMembers]) => {
        setInfo(loadedInfo);
        setMembers(loadedMembers);
      })
      .catch(err => setError(err.message));
  }, [provider]);

  if (!info) {
    return (
      <Flex justify="center" align="center" style={{ minHeight: 240 }}>
        {error ? <Empty description={error} /> : <Spin />}
      </Flex>
    );
  }

  return (
    <TasksBoard
      provider={provider}
      info={info}
      members={members}
      onOpenProject={projectId =>
        history.push({
          pathname: paths.committeeProjectPath(committeeId, projectId),
          state: { listSearch: location.search },
        })
      }
    />
  );
};

export default TasksPage;
