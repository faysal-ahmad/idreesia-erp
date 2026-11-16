import React from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { ProjectDetail } from '/imports/ui/modules/common/projects';

import { default as paths } from '../submodule-paths';
import { useCommitteeProjectsProvider } from './use-committee-projects-provider';

// One of a committee's projects.
const ProjectPage = () => {
  const { committeeId, projectId } = useParams<{
    committeeId: string;
    projectId: string;
  }>();
  const history = useHistory();
  const location = useLocation<{ listSearch?: string } | undefined>();
  const provider = useCommitteeProjectsProvider(committeeId);

  return (
    <ProjectDetail
      key={projectId}
      provider={provider}
      projectId={projectId}
      onBack={() =>
        // Back to the list as it was left (view / section).
        history.push({
          pathname: paths.committeeProjectsPath(committeeId),
          search: location.state?.listSearch ?? '',
        })
      }
    />
  );
};

export default ProjectPage;
