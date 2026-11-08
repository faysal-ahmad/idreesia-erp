import React, { useState } from 'react';
import { Button, List } from 'antd-mobile';
import { HistogramOutline } from 'antd-mobile-icons';
import { useApolloClient, useQuery } from '@apollo/client/react';

import { PageEmpty, PageError, PageLoading } from '../../layout';
import { DocumentPartPage, useDocumentPart } from './document-part';
import { describeActivity, formatDateTime, parseDetails } from './format';
import { MOBILE_WORKSPACE_DOCUMENT_ACTIVITY } from './gql';

const PAGE_SIZE = 50;

/** Everything that happened to a document, newest first. */
export const DocumentActivityScreen = () => {
  const part = useDocumentPart();
  const { committeeId, documentId } = part;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_DOCUMENT_ACTIVITY, {
    variables: { committeeId, documentId, limit: PAGE_SIZE },
    fetchPolicy: 'network-only',
  });
  const [older, setOlder] = useState<NonNullable<typeof data>['workspaceDocumentActivity']>([]);

  const entries = [...(data?.workspaceDocumentActivity ?? []), ...(older ?? [])].filter(
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
        query: MOBILE_WORKSPACE_DOCUMENT_ACTIVITY,
        variables: { committeeId, documentId, limit: PAGE_SIZE, before: last.at },
        fetchPolicy: 'network-only',
      });
      const page = result.data?.workspaceDocumentActivity ?? [];
      setOlder(current => [...(current ?? []), ...page]);
      setHasMore(page.length >= PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <DocumentPartPage part={part} title="Activity" onRefresh={refresh}>
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
              <div className="documents-load-more">
                <Button block fill="outline" loading={loadingMore} onClick={loadMore}>
                  Load more
                </Button>
              </div>
            )}
          </>
        );
      }}
    </DocumentPartPage>
  );
};
