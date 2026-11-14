import React, { type ReactNode } from 'react';
import { PieOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { type Poll, usePoll, usePollsInfo } from './use-poll';

/** What a screen under one poll (results, activity, ...) needs. */
export const usePollPart = () => {
  const { committeeId, pollId } = useParams<{ committeeId: string; pollId: string }>();
  const info = usePollsInfo(committeeId);
  const state = usePoll(committeeId, pollId);
  return {
    committeeId,
    pollId,
    ...info,
    ...state,
    backTo: WorkspacesPaths.committeePoll(committeeId, pollId),
  };
};

interface PageProps {
  title: string;
  part: ReturnType<typeof usePollPart>;
  right?: ReactNode;
  children: (poll: Poll) => ReactNode;
}

/** The screen shell, with the loading / error / not-found states. */
export const PollPartPage = ({ title, part, right, children }: PageProps) => {
  const { poll, loading, error, refetch, backTo } = part;
  let body: ReactNode;
  if (loading) body = <PageLoading />;
  else if (error) body = <PageError error={error} onRetry={refetch} />;
  else if (!poll) {
    body = (
      <PageEmpty
        description="This poll may have been deleted."
        icon={<PieOutline />}
        title="Poll not found"
      />
    );
  } else body = children(poll);

  return (
    <Page backTo={backTo} right={poll ? right : undefined} title={title}>
      {body}
    </Page>
  );
};
