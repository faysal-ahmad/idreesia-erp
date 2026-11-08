import React, { type ReactNode } from 'react';
import { CalendarOutline } from 'antd-mobile-icons';

import { Page, PageEmpty, PageError, PageLoading } from '../../layout';
import { useParams } from '../../router';
import { WorkspacesPaths } from '../paths';
import { type Meeting, useMeeting, useMeetingsInfo } from './use-meeting';

/** What a screen under one meeting (agenda, participants, ...) needs. */
export const useMeetingPart = () => {
  const { committeeId, meetingId } = useParams<{ committeeId: string; meetingId: string }>();
  const info = useMeetingsInfo(committeeId);
  const state = useMeeting(committeeId, meetingId);
  const { meeting } = state;
  return {
    committeeId,
    meetingId,
    ...info,
    ...state,
    backTo: WorkspacesPaths.committeeMeeting(committeeId, meetingId),
    /** Changes are refused on a cancelled meeting until it is reopened. */
    canChange: !!meeting && meeting.status !== 'cancelled',
  };
};

interface PageProps {
  title: string;
  part: ReturnType<typeof useMeetingPart>;
  right?: ReactNode;
  footer?: ReactNode;
  /** What pull-to-refresh reloads; defaults to the meeting. `false` where a list inside refreshes itself. */
  onRefresh?: (() => Promise<unknown>) | false;
  children: (meeting: Meeting) => ReactNode;
}

/** The screen shell, with the loading / error / not-found states. */
export const MeetingPartPage = ({ title, part, right, footer, onRefresh, children }: PageProps) => {
  const { meeting, loading, error, refetch, backTo } = part;
  let body: ReactNode;
  if (loading) body = <PageLoading />;
  else if (error) body = <PageError error={error} onRetry={refetch} />;
  else if (!meeting) {
    body = (
      <PageEmpty
        description="This meeting may have been deleted."
        icon={<CalendarOutline />}
        title="Meeting not found"
      />
    );
  } else body = children(meeting);

  return (
    <Page
      backTo={backTo}
      footer={meeting ? footer : undefined}
      onRefresh={meeting && onRefresh !== false ? (onRefresh ?? part.refetch) : undefined}
      right={meeting ? right : undefined}
      title={title}
    >
      {body}
    </Page>
  );
};
