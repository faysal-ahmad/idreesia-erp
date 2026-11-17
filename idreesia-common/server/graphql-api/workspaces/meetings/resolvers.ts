import { GraphQLError } from 'graphql';

import {
  abortAttachmentUpload,
  addAgendaItem,
  cancelMeeting,
  completeMeeting,
  createActionItem,
  deleteActionItem,
  deleteAttachment,
  deleteMeeting,
  getMeetingVideoCallParticipantCount,
  getMeetingVideoCallUrl,
  markAttendance,
  removeAgendaItem,
  reorderAgenda,
  reopenMeeting,
  respondToInvitation,
  setActionItemStatus,
  setMinutes,
  setParticipantRole,
  updateActionItem,
  updateAgendaItem,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import {
  completeCommitteeMeetingUpload,
  createCommitteeMeeting,
  createCommitteeMeetingUpload,
  getCommitteeMeeting,
  getCommitteeMeetingActivity,
  getCommitteeMeetingDownloadUrl,
  getCommitteeMeetingMembers,
  getCommitteeMeetingsInfo,
  listCommitteeActionItems,
  listCommitteeMeetingAttachments,
  listCommitteeMeetings,
  mapCommitteeActionItems,
  parseTimestamp,
  setCommitteeMeetingParticipants,
  toCommitteeMeeting,
  updateCommitteeMeeting,
  type MeetingsView,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';
import { MEETINGS_DEFAULT_TIME_ZONE } from 'meteor/idreesia-common/constants/meetings';

import {
  assertActionItemInWorkspace,
  assertAttachmentInWorkspace,
  assertMeetingInWorkspace,
  assertMembers,
  assertUploadInWorkspace,
  getMeetingsAccess,
  guestParticipantId,
  type MeetingsAccess,
} from './access';

type ResolverField = ((...args: any[]) => any) | ResolverMap;
interface ResolverMap {
  [key: string]: ResolverField;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

/** The meeting as the UI shows it, after a change. */
const view = (
  access: MeetingsAccess,
  meeting: Parameters<typeof toCommitteeMeeting>[0]
) => toCommitteeMeeting(meeting, access);

/** A meeting of the committee, for a coordinator. */
const managedMeeting = async (
  context: unknown,
  committeeId: string,
  meetingId: string
) => {
  const access = getMeetingsAccess(context as any, committeeId);
  const meeting = await assertMeetingInWorkspace(access, meetingId);
  return { access, meeting };
};

const actionItemInput = (input: {
  title: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  agendaItemId?: string | null;
}) => ({
  title: input.title,
  description: input.description ?? null,
  assigneeId: input.assigneeId || null,
  dueDate: parseTimestamp(input.dueDate) ?? null,
  agendaItemId: input.agendaItemId || null,
});

// Who may call each field (committee role) is declared in the schema with
// @checkCommitteeAccess. The resolvers only check what the role cannot tell:
// Meetings enabled on the committee, members acting only for themselves, ids
// belonging to the committee's workspace, a guest being invited to the
// meeting, participants being committee members. The meetings module and the
// committee meetings logic do the work, and the module enforces the meeting
// status rules.
const resolvers: ResolverMap = {
  Query: {
    workspaceMeetingsInfo: async (obj, { committeeId }, context) => {
      const access = getMeetingsAccess(context, committeeId);
      return {
        ...(await getCommitteeMeetingsInfo(access.workspaceId, access)),
        canJoinVideoCall: access.canJoinVideoCall,
      };
    },

    workspaceMeetingMembers: async (obj, { committeeId }, context) => {
      const access = getMeetingsAccess(context, committeeId);
      return getCommitteeMeetingMembers(access.committee);
    },

    workspaceMeetings: async (
      obj,
      { committeeId, view: meetingsView, from, to, text, pageIndex, pageSize },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      return listCommitteeMeetings(access.workspaceId, access, {
        view: meetingsView as MeetingsView | null,
        from,
        to,
        text,
        participantId: guestParticipantId(access),
        pageIndex,
        pageSize,
      });
    },

    workspaceMeetingById: async (obj, { committeeId, meetingId }, context) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return getCommitteeMeeting(meetingId, access);
    },

    workspaceMeetingVideoCallInfo: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return {
        participantCount: await getMeetingVideoCallParticipantCount(
          meetingId,
          access.userId
        ),
      };
    },

    workspaceMeetingAttachments: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return listCommitteeMeetingAttachments(meetingId, access);
    },

    workspaceMeetingActionItems: async (
      obj,
      { committeeId, meetingId, assigneeId, status, pageIndex, pageSize },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      if (meetingId) await assertMeetingInWorkspace(access, meetingId);
      return listCommitteeActionItems(access.workspaceId, access, {
        meetingId,
        assigneeId,
        status,
        participantId: guestParticipantId(access),
        pageIndex,
        pageSize,
      });
    },

    workspaceMeetingActivity: async (
      obj,
      { committeeId, meetingId, before, limit },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      if (meetingId) await assertMeetingInWorkspace(access, meetingId);
      return getCommitteeMeetingActivity(access.workspaceId, access, {
        meetingId,
        before,
        limit,
      });
    },
  },

  Mutation: {
    workspaceCreateMeeting: async (
      obj,
      { committeeId, input, participantIds },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      const ids: string[] = (participantIds ?? []).filter(Boolean);
      assertMembers(access, ids);
      const meeting = await createCommitteeMeeting(
        access.workspaceId,
        input,
        ids,
        MEETINGS_DEFAULT_TIME_ZONE,
        access.userId
      );
      return view(access, meeting);
    },

    workspaceUpdateMeeting: async (
      obj,
      { committeeId, meetingId, input },
      context
    ) => {
      const { access, meeting } = await managedMeeting(
        context,
        committeeId,
        meetingId
      );
      return view(
        access,
        await updateCommitteeMeeting(meeting, input, access.userId)
      );
    },

    workspaceJoinMeetingVideoCall: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return getMeetingVideoCallUrl(meetingId, access.userId);
    },

    workspaceCancelMeeting: async (
      obj,
      { committeeId, meetingId, reason },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await cancelMeeting(meetingId, access.userId, {
          reason: reason ?? undefined,
        })
      );
    },

    workspaceCompleteMeeting: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(access, await completeMeeting(meetingId, access.userId));
    },

    workspaceReopenMeeting: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(access, await reopenMeeting(meetingId, access.userId));
    },

    workspaceDeleteMeeting: async (
      obj,
      { committeeId, meetingId },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      await deleteMeeting(meetingId, access.userId);
      return true;
    },

    workspaceSetMeetingParticipants: async (
      obj,
      { committeeId, meetingId, participantIds },
      context
    ) => {
      const { access, meeting } = await managedMeeting(
        context,
        committeeId,
        meetingId
      );
      const ids: string[] = (participantIds ?? []).filter(Boolean);
      assertMembers(access, ids);
      return view(
        access,
        await setCommitteeMeetingParticipants(meeting, ids, access.userId)
      );
    },

    workspaceSetMeetingParticipantRole: async (
      obj,
      { committeeId, meetingId, participantId, role },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await setParticipantRole(meetingId, participantId, role, access.userId)
      );
    },

    workspaceRespondToMeeting: async (
      obj,
      { committeeId, meetingId, participantId, status, comment },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      const respondingFor = participantId || access.personId;
      if (!respondingFor) {
        throw forbidden('You are not a participant of this meeting.');
      }
      if (respondingFor !== access.personId && !access.isCoordinator) {
        throw forbidden('You can only respond for yourself.');
      }
      return view(
        access,
        await respondToInvitation(
          meetingId,
          respondingFor,
          { status, comment },
          access.userId
        )
      );
    },

    workspaceMarkMeetingAttendance: async (
      obj,
      { committeeId, meetingId, entries },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await markAttendance(meetingId, entries ?? [], access.userId)
      );
    },

    workspaceAddMeetingAgendaItem: async (
      obj,
      { committeeId, meetingId, input },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      assertMembers(access, [input.presenterId]);
      const { meeting } = await addAgendaItem(
        meetingId,
        {
          title: input.title,
          description: input.description ?? undefined,
          durationMinutes: input.durationMinutes ?? undefined,
          presenterId: input.presenterId || undefined,
        },
        access.userId
      );
      return view(access, meeting);
    },

    workspaceUpdateMeetingAgendaItem: async (
      obj,
      { committeeId, meetingId, agendaItemId, input },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      assertMembers(access, [input.presenterId]);
      return view(
        access,
        await updateAgendaItem(
          meetingId,
          agendaItemId,
          {
            title: input.title,
            description: input.description ?? null,
            durationMinutes: input.durationMinutes ?? null,
            presenterId: input.presenterId || null,
          },
          access.userId
        )
      );
    },

    workspaceRemoveMeetingAgendaItem: async (
      obj,
      { committeeId, meetingId, agendaItemId },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await removeAgendaItem(meetingId, agendaItemId, access.userId)
      );
    },

    workspaceReorderMeetingAgenda: async (
      obj,
      { committeeId, meetingId, agendaItemIds },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await reorderAgenda(meetingId, agendaItemIds ?? [], access.userId)
      );
    },

    workspaceSetMeetingMinutes: async (
      obj,
      { committeeId, meetingId, text },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      return view(
        access,
        await setMinutes(meetingId, text ?? null, access.userId)
      );
    },

    workspaceCreateMeetingAttachmentUpload: async (
      obj,
      { committeeId, meetingId, fileName, mimeType, size },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return createCommitteeMeetingUpload(
        meetingId,
        { fileName, mimeType, size },
        access
      );
    },

    workspaceCompleteMeetingAttachmentUpload: async (
      obj,
      { committeeId, uploadId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertUploadInWorkspace(access, uploadId);
      return completeCommitteeMeetingUpload(uploadId, access);
    },

    workspaceAbortMeetingAttachmentUpload: async (
      obj,
      { committeeId, uploadId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertUploadInWorkspace(access, uploadId);
      await abortAttachmentUpload(uploadId, access.userId);
      return true;
    },

    workspaceMeetingAttachmentDownloadUrl: async (
      obj,
      { committeeId, attachmentId, inline },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertAttachmentInWorkspace(access, attachmentId);
      return getCommitteeMeetingDownloadUrl(attachmentId, access, { inline });
    },

    workspaceDeleteMeetingAttachment: async (
      obj,
      { committeeId, attachmentId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertAttachmentInWorkspace(access, attachmentId);
      await deleteAttachment(attachmentId, access.userId);
      return true;
    },

    workspaceCreateMeetingActionItem: async (
      obj,
      { committeeId, meetingId, input },
      context
    ) => {
      const { access } = await managedMeeting(context, committeeId, meetingId);
      assertMembers(access, [input.assigneeId]);
      const fields = actionItemInput(input);
      const item = await createActionItem(
        {
          meetingId,
          title: fields.title,
          description: fields.description ?? undefined,
          assigneeId: fields.assigneeId ?? undefined,
          dueDate: fields.dueDate ?? undefined,
          agendaItemId: fields.agendaItemId ?? undefined,
        },
        access.userId
      );
      return (await mapCommitteeActionItems([item], access))[0];
    },

    workspaceUpdateMeetingActionItem: async (
      obj,
      { committeeId, actionItemId, input },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertActionItemInWorkspace(access, actionItemId);
      assertMembers(access, [input.assigneeId]);
      const item = await updateActionItem(
        actionItemId,
        actionItemInput(input),
        access.userId
      );
      return (await mapCommitteeActionItems([item], access))[0];
    },

    workspaceSetMeetingActionItemStatus: async (
      obj,
      { committeeId, actionItemId, status },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      const existing = await assertActionItemInWorkspace(access, actionItemId);
      const isAssignee =
        !!existing.assigneeId && existing.assigneeId === access.personId;
      if (!access.isCoordinator && !isAssignee) {
        throw forbidden(
          'Only coordinators and the assignee can change its status.'
        );
      }
      const item = await setActionItemStatus(
        actionItemId,
        status,
        access.userId
      );
      return (await mapCommitteeActionItems([item], access))[0];
    },

    workspaceDeleteMeetingActionItem: async (
      obj,
      { committeeId, actionItemId },
      context
    ) => {
      const access = getMeetingsAccess(context, committeeId);
      await assertActionItemInWorkspace(access, actionItemId);
      await deleteActionItem(actionItemId, access.userId);
      return true;
    },
  },
};

export default resolvers;
