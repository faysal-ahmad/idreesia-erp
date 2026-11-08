import { useQuery } from '@apollo/client/react';
import type {
  MobileWorkspaceMeetingFieldsFragment,
  MobileWorkspaceMeetingMembersQuery,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MOBILE_WORKSPACE_MEETING_BY_ID,
  MOBILE_WORKSPACE_MEETING_MEMBERS,
  MOBILE_WORKSPACE_MEETINGS_INFO,
} from './gql';

export type Meeting = MobileWorkspaceMeetingFieldsFragment;
export type Participant = NonNullable<NonNullable<Meeting['participants']>[number]>;
export type AgendaItem = NonNullable<NonNullable<Meeting['agenda']>[number]>;
export type Member = NonNullable<
  NonNullable<MobileWorkspaceMeetingMembersQuery['workspaceMeetingMembers']>[number]
>;

/** Who the user is in this committee's meetings, and who can be invited. */
export const useMeetingsInfo = (committeeId: string) => {
  const info = useQuery(MOBILE_WORKSPACE_MEETINGS_INFO, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  const members = useQuery(MOBILE_WORKSPACE_MEETING_MEMBERS, {
    variables: { committeeId },
    fetchPolicy: 'cache-and-network',
  });
  return {
    canManage: !!info.data?.workspaceMeetingsInfo?.canManage,
    maxFileSize: info.data?.workspaceMeetingsInfo?.maxFileSize ?? 0,
    members: (members.data?.workspaceMeetingMembers ?? []).filter(
      (member): member is Member & { participantId: string } => !!member?.participantId,
    ),
  };
};

/**
 * One meeting. Every meeting screen reads it from here; the mutations
 * return the updated meeting, so Apollo's cache keeps the screens in step.
 */
export const useMeeting = (
  committeeId: string,
  meetingId: string,
  { skip = false }: { skip?: boolean } = {},
) => {
  const { data, loading, error, refetch } = useQuery(MOBILE_WORKSPACE_MEETING_BY_ID, {
    variables: { committeeId, meetingId },
    fetchPolicy: 'cache-and-network',
    skip,
  });
  const meeting = data?.workspaceMeetingById ?? null;
  const participants = (meeting?.participants ?? []).filter(
    (participant): participant is Participant & { participantId: string } =>
      !!participant?.participantId,
  );
  const agenda = (meeting?.agenda ?? []).filter(
    (item): item is AgendaItem & { _id: string } => !!item?._id,
  );
  return {
    meeting,
    participants,
    agenda,
    loading: loading && !meeting,
    error: meeting ? undefined : error,
    refetch: () => refetch().then(
      () => undefined,
      () => undefined,
    ),
  };
};
