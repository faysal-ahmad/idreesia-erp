import { useCallback, useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';

import { CommitteeFeatureKeys } from 'meteor/idreesia-common/constants/hr';
import type {
  MobileWorkspaceMeetingActionItemsQuery,
  MobileWorkspaceMeetingsQuery,
  MobileWorkspacePollsQuery,
} from 'meteor/idreesia-common/types/client-operations';
import { MOBILE_MY_COMMITTEES } from '../workspaces/gql';
import { MOBILE_WORKSPACE_MEETING_ACTION_ITEMS, MOBILE_WORKSPACE_MEETINGS } from '../workspaces/meetings/gql';
import { MOBILE_WORKSPACE_POLLS } from '../workspaces/polls/gql';

type Meeting = NonNullable<
  NonNullable<MobileWorkspaceMeetingsQuery['workspaceMeetings']>['data']
>[number];
type ActionItem = NonNullable<
  NonNullable<MobileWorkspaceMeetingActionItemsQuery['workspaceMeetingActionItems']>['data']
>[number];
type Poll = NonNullable<NonNullable<MobileWorkspacePollsQuery['workspacePolls']>['data']>[number];

export type HomeMeeting = NonNullable<Meeting> & { _id: string; committeeId: string; committeeName: string };
export type HomeActionItem = NonNullable<ActionItem> & { _id: string; meetingId: string; committeeId: string };
export type HomePoll = NonNullable<Poll> & { _id: string; committeeId: string; committeeName: string };

const PAGE_SIZE = 20;

/**
 * Upcoming meetings and open polls across every workspace the user belongs
 * to, using the same per-workspace queries as the workspace screens.
 */
export const useHomeItems = () => {
  const client = useApolloClient();
  const [state, setState] = useState<{
    loading: boolean;
    error: Error | null;
    meetings: HomeMeeting[];
    polls: HomePoll[];
    actionItems: HomeActionItem[];
  }>({ loading: true, error: null, meetings: [], polls: [], actionItems: [] });

  // Reads from the server, or (cache-only) from what was loaded before, so
  // the Home tab still shows something when the device is offline.
  const fetchItems = useCallback(
    async (fetchPolicy: 'network-only' | 'cache-only') => {
      const { data } = await client.query({
        query: MOBILE_MY_COMMITTEES,
        fetchPolicy,
      });
      if (fetchPolicy === 'cache-only' && !data?.myCommittees) {
        throw new Error('Nothing is saved on this device yet.');
      }
      const committees = (data?.myCommittees ?? []).filter(
        (committee): committee is NonNullable<typeof committee> & { _id: string } =>
          committee?._id != null,
      );

      const perCommittee = await Promise.all(
        committees.map(async committee => {
          const committeeId = committee._id;
          const committeeName = committee.name ?? '';
          const [meetingsResult, pollsResult, actionItemsResult] = await Promise.all([
            committee.features?.includes(CommitteeFeatureKeys.MEETINGS)
              ? client.query({
                  query: MOBILE_WORKSPACE_MEETINGS,
                  variables: { committeeId, view: 'upcoming', pageIndex: 0, pageSize: PAGE_SIZE },
                  fetchPolicy,
                })
              : null,
            committee.features?.includes(CommitteeFeatureKeys.POLLS)
              ? client.query({
                  query: MOBILE_WORKSPACE_POLLS,
                  variables: { committeeId, view: 'open', pageIndex: 0, pageSize: PAGE_SIZE },
                  fetchPolicy,
                })
              : null,
            // Open items assigned to the user, from meetings that have ended.
            committee.features?.includes(CommitteeFeatureKeys.MEETINGS)
              ? client.query({
                  query: MOBILE_WORKSPACE_MEETING_ACTION_ITEMS,
                  variables: {
                    committeeId,
                    assigneeId: 'me',
                    status: ['open', 'in-progress'],
                    pageIndex: 0,
                    pageSize: 50,
                  },
                  fetchPolicy,
                })
              : null,
          ]);
          const now = Date.now();
          const actionItems = (actionItemsResult?.data?.workspaceMeetingActionItems?.data ?? [])
            .filter(
              (item): item is NonNullable<typeof item> & { _id: string; meetingId: string } =>
                item?._id != null && item.meetingId != null && Number(item.meetingEndsAt) <= now,
            )
            .map(item => ({ ...item, committeeId }));
          const meetings = (meetingsResult?.data?.workspaceMeetings?.data ?? [])
            .filter((m): m is NonNullable<typeof m> & { _id: string } => m?._id != null)
            .map(m => ({ ...m, committeeId, committeeName }));
          const polls = (pollsResult?.data?.workspacePolls?.data ?? [])
            .filter((p): p is NonNullable<typeof p> & { _id: string } => p?._id != null)
            .map(p => ({ ...p, committeeId, committeeName }));
          return { meetings, polls, actionItems };
        }),
      );

      const meetings = perCommittee
        .flatMap(item => item.meetings)
        .sort((a, b) => Number(a.startsAt) - Number(b.startsAt));
      const polls = perCommittee
        .flatMap(item => item.polls)
        .sort((a, b) => Number(a.closesAt) - Number(b.closesAt));
      // Oldest meeting first: those have waited longest.
      const actionItems = perCommittee
        .flatMap(item => item.actionItems)
        .sort((a, b) => Number(a.meetingEndsAt) - Number(b.meetingEndsAt));
      return { meetings, polls, actionItems };
    },
    [client],
  );

  const load = useCallback(async () => {
    try {
      const items = await fetchItems('network-only');
      setState({ loading: false, error: null, ...items });
    } catch (error) {
      try {
        const saved = await fetchItems('cache-only');
        setState({ loading: false, error: null, ...saved });
      } catch {
        setState(prev => ({ ...prev, loading: false, error: error as Error }));
      }
    }
  }, [fetchItems]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...state, refresh: load };
};
