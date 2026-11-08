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

/** Checks a coordinator's access and that the meeting is the committee's. */
const managedMeeting = async (
  user: unknown,
  committeeId: string,
  meetingId: string
) => {
  const access = await getMeetingsAccess(user as any, committeeId, {
    coordinator: true,
  });
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

// Each resolver only checks access - committee membership + Meetings
// enabled, coordinators for managing meetings, members acting only for
// themselves, ids belonging to the committee's workspace, participants
// being committee members. The meetings module and the committee meetings
// logic do the work, and the module enforces the meeting status rules.
const resolvers: ResolverMap = {
  Query: {
    workspaceMeetingsInfo: async (obj, { committeeId }, { user }) => {
      const access = await getMeetingsAccess(user, committeeId);
      return getCommitteeMeetingsInfo(access.workspaceId, access);
    },

    workspaceMeetingMembers: async (obj, { committeeId }, { user }) => {
      const access = await getMeetingsAccess(user, committeeId);
      return getCommitteeMeetingMembers(access.committee);
    },

    workspaceMeetings: async (
      obj,
      { committeeId, view: meetingsView, from, to, text, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
      return listCommitteeMeetings(access.workspaceId, access, {
        view: meetingsView as MeetingsView | null,
        from,
        to,
        text,
        pageIndex,
        pageSize,
      });
    },

    workspaceMeetingById: async (obj, { committeeId, meetingId }, { user }) => {
      const access = await getMeetingsAccess(user, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return getCommitteeMeeting(meetingId, access);
    },

    workspaceMeetingAttachments: async (
      obj,
      { committeeId, meetingId },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
      await assertMeetingInWorkspace(access, meetingId);
      return listCommitteeMeetingAttachments(meetingId, access);
    },

    workspaceMeetingActionItems: async (
      obj,
      { committeeId, meetingId, assigneeId, status, pageIndex, pageSize },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
      if (meetingId) await assertMeetingInWorkspace(access, meetingId);
      return listCommitteeActionItems(access.workspaceId, access, {
        meetingId,
        assigneeId,
        status,
        pageIndex,
        pageSize,
      });
    },

    workspaceMeetingActivity: async (
      obj,
      { committeeId, meetingId, before, limit },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
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
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
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
      { user }
    ) => {
      const { access, meeting } = await managedMeeting(
        user,
        committeeId,
        meetingId
      );
      return view(
        access,
        await updateCommitteeMeeting(meeting, input, access.userId)
      );
    },

    workspaceCancelMeeting: async (
      obj,
      { committeeId, meetingId, reason },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
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
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(access, await completeMeeting(meetingId, access.userId));
    },

    workspaceReopenMeeting: async (
      obj,
      { committeeId, meetingId },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(access, await reopenMeeting(meetingId, access.userId));
    },

    workspaceDeleteMeeting: async (
      obj,
      { committeeId, meetingId },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      await deleteMeeting(meetingId, access.userId);
      return true;
    },

    workspaceSetMeetingParticipants: async (
      obj,
      { committeeId, meetingId, participantIds },
      { user }
    ) => {
      const { access, meeting } = await managedMeeting(
        user,
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
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(
        access,
        await setParticipantRole(meetingId, participantId, role, access.userId)
      );
    },

    workspaceRespondToMeeting: async (
      obj,
      { committeeId, meetingId, participantId, status, comment },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
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
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(
        access,
        await markAttendance(meetingId, entries ?? [], access.userId)
      );
    },

    workspaceAddMeetingAgendaItem: async (
      obj,
      { committeeId, meetingId, input },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
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
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
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
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(
        access,
        await removeAgendaItem(meetingId, agendaItemId, access.userId)
      );
    },

    workspaceReorderMeetingAgenda: async (
      obj,
      { committeeId, meetingId, agendaItemIds },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(
        access,
        await reorderAgenda(meetingId, agendaItemIds ?? [], access.userId)
      );
    },

    workspaceSetMeetingMinutes: async (
      obj,
      { committeeId, meetingId, text },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
      return view(
        access,
        await setMinutes(meetingId, text ?? null, access.userId)
      );
    },

    workspaceCreateMeetingAttachmentUpload: async (
      obj,
      { committeeId, meetingId, fileName, mimeType, size },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
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
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertUploadInWorkspace(access, uploadId);
      return completeCommitteeMeetingUpload(uploadId, access);
    },

    workspaceAbortMeetingAttachmentUpload: async (
      obj,
      { committeeId, uploadId },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertUploadInWorkspace(access, uploadId);
      await abortAttachmentUpload(uploadId, access.userId);
      return true;
    },

    workspaceMeetingAttachmentDownloadUrl: async (
      obj,
      { committeeId, attachmentId, inline },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
      await assertAttachmentInWorkspace(access, attachmentId);
      return getCommitteeMeetingDownloadUrl(attachmentId, access, { inline });
    },

    workspaceDeleteMeetingAttachment: async (
      obj,
      { committeeId, attachmentId },
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
      const attachment = await assertAttachmentInWorkspace(
        access,
        attachmentId
      );
      await deleteAttachment(attachmentId, access.userId);
      return true;
    },

    workspaceCreateMeetingActionItem: async (
      obj,
      { committeeId, meetingId, input },
      { user }
    ) => {
      const { access } = await managedMeeting(user, committeeId, meetingId);
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
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
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
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId);
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
      { user }
    ) => {
      const access = await getMeetingsAccess(user, committeeId, {
        coordinator: true,
      });
      await assertActionItemInWorkspace(access, actionItemId);
      await deleteActionItem(actionItemId, access.userId);
      return true;
    },
  },
};

export default resolvers;
