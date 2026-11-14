import React, { useCallback, useEffect, useState } from 'react';
import { Button, Empty, Flex, Spin, Timeline, Typography } from 'antd';

import { message } from '/imports/ui/antd-feedback';

import { describeActivity, formatDateTime } from './format';
import type { Project, ProjectsActivity, ProjectsDataProvider } from './types';

const PAGE_SIZE = 50;

interface Props {
  provider: ProjectsDataProvider;
  project: Project;
}

/** Everything that happened in the project, newest first. */
const ActivityPanel = ({ provider, project }: Props) => {
  const [entries, setEntries] = useState<ProjectsActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const load = useCallback(
    async (before?: string) => {
      setLoading(true);
      try {
        const page = await provider.loadActivity(
          { projectId: project._id },
          before
        );
        setEntries(current => (before ? [...current, ...page] : page));
        setHasMore(page.length >= PAGE_SIZE);
      } catch (error) {
        message.error(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    },
    [provider, project._id]
  );

  // Reload when the project changes, so new entries show up.
  useEffect(() => {
    load();
  }, [load, project.updatedAt, project.taskCount, project.doneCount]);

  if (loading && !entries.length) {
    return (
      <Flex justify="center" style={{ padding: 24 }}>
        <Spin />
      </Flex>
    );
  }
  if (!entries.length) return <Empty description="No activity yet" />;

  return (
    <div className="project-activity">
      <Timeline
        items={entries.map(entry => ({
          key: entry._id,
          children: (
            <div>
              <Typography.Text strong>{entry.userName ?? 'Someone'}</Typography.Text>{' '}
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
