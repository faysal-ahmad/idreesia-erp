import React, { useState } from 'react';
import { Button, List } from 'antd-mobile';
import { HistogramOutline } from 'antd-mobile-icons';
import { useApolloClient, useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading } from '../../layout';
import { describeActivity, formatDateTime } from './format';
import { MOBILE_WORKSPACE_PROJECTS_ACTIVITY } from './gql';
import { ProjectPartPage, useProjectPart } from './project-part';

const PAGE_SIZE = 50;

const parseDetails = (details?: string | null) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/** Coordinators: everything that happened in a project, newest first. */
export const ProjectActivityScreen = () => {
  const part = useProjectPart();
  const { committeeId, projectId } = part;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_PROJECTS_ACTIVITY, {
    variables: { committeeId, projectId, limit: PAGE_SIZE },
    fetchPolicy: 'cache-and-network',
  });
  const [older, setOlder] = useState<NonNullable<typeof data>['workspaceProjectsActivity']>([]);

  const entries = [...(data?.workspaceProjectsActivity ?? []), ...(older ?? [])].filter(
    (entry): entry is NonNullable<typeof entry> & { _id: string } => !!entry?._id,
  );

  const loadMore = async () => {
    const last = entries[entries.length - 1];
    if (!last?.at) return;
    setLoadingMore(true);
    try {
      const result = await client.query({
        query: MOBILE_WORKSPACE_PROJECTS_ACTIVITY,
        variables: { committeeId, projectId, limit: PAGE_SIZE, before: last.at },
        fetchPolicy: 'network-only',
      });
      const page = result.data?.workspaceProjectsActivity ?? [];
      setOlder(current => [...(current ?? []), ...page]);
      setHasMore(page.length >= PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <ProjectPartPage part={part} title="Activity">
      {() => {
        if (loading && !data) return <PageLoading />;
        if (error && !data) return <PageError error={error} onRetry={() => refetch()} />;
        if (entries.length === 0) return <PageEmpty icon={<HistogramOutline />} title="No activity yet" />;
        return (
          <>
            <List mode="card">
              {entries.map(entry => (
                <List.Item key={entry._id} description={formatDateTime(entry.at)}>
                  <strong>{entry.userName ?? 'Someone'}</strong>{' '}
                  {describeActivity(entry.action ?? '', parseDetails(entry.details))}
                </List.Item>
              ))}
            </List>
            {hasMore && entries.length >= PAGE_SIZE && (
              <div className="project-load-more">
                <Button block fill="outline" loading={loadingMore} onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        );
      }}
    </ProjectPartPage>
  );
};
