import React, { useState } from 'react';
import { Button, List } from 'antd-mobile';
import { HistogramOutline } from 'antd-mobile-icons';
import { useApolloClient, useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading } from '../../layout';
import { describeActivity, formatDateTime } from './format';
import { MOBILE_WORKSPACE_MEETING_ACTIVITY } from './gql';
import { MeetingPartPage, useMeetingPart } from './meeting-part';

const PAGE_SIZE = 50;

const parseDetails = (details?: string | null) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/** Everything that happened to a meeting, newest first. */
export const ActivityScreen = () => {
  const part = useMeetingPart();
  const { committeeId, meetingId } = part;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_MEETING_ACTIVITY, {
    variables: { committeeId, meetingId, limit: PAGE_SIZE },
    fetchPolicy: 'network-only',
  });
  const [older, setOlder] = useState<NonNullable<typeof data>['workspaceMeetingActivity']>([]);

  const entries = [...(data?.workspaceMeetingActivity ?? []), ...(older ?? [])].filter(
    (entry): entry is NonNullable<typeof entry> & { _id: string } => !!entry?._id,
  );

  // Reload the newest entries and drop the older pages loaded after them.
  const refresh = async () => {
    setOlder([]);
    setHasMore(true);
    await refetch();
  };

  const loadMore = async () => {
    const last = entries[entries.length - 1];
    if (!last?.at) return;
    setLoadingMore(true);
    try {
      const result = await client.query({
        query: MOBILE_WORKSPACE_MEETING_ACTIVITY,
        variables: { committeeId, meetingId, limit: PAGE_SIZE, before: last.at },
        fetchPolicy: 'network-only',
      });
      const page = result.data?.workspaceMeetingActivity ?? [];
      setOlder(current => [...(current ?? []), ...page]);
      setHasMore(page.length >= PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <MeetingPartPage part={part} title="Activity" onRefresh={refresh}>
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
              <div className="meeting-load-more">
                <Button block fill="outline" loading={loadingMore} onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        );
      }}
    </MeetingPartPage>
  );
};
