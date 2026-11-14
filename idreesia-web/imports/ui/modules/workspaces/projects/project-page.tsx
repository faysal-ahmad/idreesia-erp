import React, { useMemo } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import { useApolloClient } from '@apollo/client/react';

import { Discussion } from '/imports/ui/modules/common/discussions';
import { ProjectDetail } from '/imports/ui/modules/common/projects';

import { CommitteeDiscussionProvider } from '../discussions';
import { default as paths } from '../submodule-paths';
import { projectDiscussionScope } from './project-discussion-scope';
import { useCommitteeProjectsProvider } from './use-committee-projects-provider';

// One of a committee's projects. Its Chat tab is the reusable discussion UI,
// scoped to the project's private chat group.
const ProjectPage = () => {
  const { committeeId, projectId } = useParams<{
    committeeId: string;
    projectId: string;
  }>();
  const history = useHistory();
  const location = useLocation<{ listSearch?: string } | undefined>();
  const client = useApolloClient();
  const provider = useCommitteeProjectsProvider(committeeId);

  const chatProvider = useMemo(
    () =>
      new CommitteeDiscussionProvider(
        client,
        committeeId,
        projectDiscussionScope(committeeId, projectId)
      ),
    [client, committeeId, projectId]
  );

  return (
    <ProjectDetail
      key={projectId}
      provider={provider}
      projectId={projectId}
      renderChat={project => (
        <Discussion provider={chatProvider} title={`${project.title} Chat`} />
      )}
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
