import React, { type ReactNode } from 'react';
import { UnorderedListOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { type Project, useProject, useProjectsInfo } from './use-projects';

/** What a screen under one project (participants, tasks, ...) needs. */
export const useProjectPart = () => {
  const { committeeId, projectId } = useParams<{ committeeId: string; projectId: string }>();
  const info = useProjectsInfo(committeeId);
  const state = useProject(committeeId, projectId);
  return {
    committeeId,
    projectId,
    ...info,
    ...state,
    backTo: WorkspacesPaths.committeeProject(committeeId, projectId),
  };
};

interface PageProps {
  title: string;
  part: ReturnType<typeof useProjectPart>;
  right?: ReactNode;
  footer?: ReactNode;
  children: (project: Project) => ReactNode;
}

/** The screen shell, with the loading / error / not-found states. */
export const ProjectPartPage = ({ title, part, right, footer, children }: PageProps) => {
  const { project, loading, error, refetch, backTo } = part;
  let body: ReactNode;
  if (loading) body = <PageLoading />;
  else if (error) body = <PageError error={error} onRetry={refetch} />;
  else if (!project) {
    body = (
      <PageEmpty
        description="This project may have been deleted."
        icon={<UnorderedListOutline />}
        title="Project not found"
      />
    );
  } else body = children(project);

  return (
    <Page backTo={backTo} footer={project ? footer : undefined} right={project ? right : undefined} title={title}>
      {body}
    </Page>
  );
};
