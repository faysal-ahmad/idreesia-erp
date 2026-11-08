import React, { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Flex, Spin, Timeline, Typography } from 'antd';

import { message } from '/imports/ui/antd-feedback';

import { describeActivity, formatDateTime } from './format';
import type { MeetingActivity } from './types';
import type { PanelProps } from './panel-props';

const PAGE_SIZE = 50;

/** Everything that happened to the meeting, newest first. */
const ActivityPanel = ({ provider, meeting }: PanelProps) => {
  const [entries, setEntries] = useState<MeetingActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (before?: string) => {
      setLoading(true);
      try {
        const page = await provider.loadActivity(meeting._id, before);
        setEntries(current => (before ? [...current, ...page] : page));
        setHasMore(page.length >= PAGE_SIZE);
      } catch (error) {
        message.error(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [provider, meeting._id]
  );

  // Reload when the meeting changes, so new entries show up.
  useEffect(() => {
    load();
  }, [load, meeting.updatedAt]);

  if (loading && !entries.length) {
    return (
      <Flex justify="center" style={{ padding: 24 }}>
        <Spin />
      </Flex>
    );
  }
  if (!entries.length) return <Empty description="No activity yet" />;

  return (
    <div className="meeting-activity">
      <Timeline
        items={entries.map(entry => ({
          key: entry._id,
          children: (
            <div>
              <Typography.Text strong>
                {entry.userName ?? 'Someone'}
              </Typography.Text>{' '}
              {describeActivity(entry)}
              <div>
                <Typography.Text type="secondary">
                  {formatDateTime(entry.at)}
                </Typography.Text>
              </div>
            </div>
          ),
        }))}
      />
      {hasMore ? (
        <Button
          loading={loading}
          onClick={() => load(entries[entries.length - 1]?.at ?? undefined)}
        >
          Load More
        </Button>
      ) : null}
    </div>
  );
};

export default ActivityPanel;
