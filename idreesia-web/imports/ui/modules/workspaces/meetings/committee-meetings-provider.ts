import type { ApolloClient } from '@apollo/client';
import type {
  WorkspaceMeetingActionItemFieldsFragment,
  WorkspaceMeetingAttachmentFieldsFragment,
  WorkspaceMeetingFieldsFragment,
} from 'meteor/idreesia-common/types/client-operations';

import {
  MeetingsError,
  type ActionItemInput,
  type ActionItemPage,
  type ActionItemsQuery,
  type ActionItemStatus,
  type AgendaItemInput,
  type AttendanceEntry,
  type AttendanceStatus,
  type Meeting,
  type MeetingActionItem,
  type MeetingActivity,
  type MeetingAttachment,
  type MeetingDetails,
  type MeetingMember,
  type MeetingPage,
  type MeetingsDataProvider,
  type MeetingsInfo,
  type MeetingsQuery,
  type MeetingStatus,
  type ParticipantRole,
  type RsvpStatus,
} from '/imports/ui/modules/common/meetings';

import {
  WORKSPACE_ABORT_MEETING_ATTACHMENT_UPLOAD,
  WORKSPACE_ADD_MEETING_AGENDA_ITEM,
  WORKSPACE_CANCEL_MEETING,
  WORKSPACE_COMPLETE_MEETING,
  WORKSPACE_COMPLETE_MEETING_ATTACHMENT_UPLOAD,
  WORKSPACE_CREATE_MEETING,
  WORKSPACE_CREATE_MEETING_ACTION_ITEM,
  WORKSPACE_CREATE_MEETING_ATTACHMENT_UPLOAD,
  WORKSPACE_DELETE_MEETING,
  WORKSPACE_DELETE_MEETING_ACTION_ITEM,
  WORKSPACE_DELETE_MEETING_ATTACHMENT,
  WORKSPACE_MARK_MEETING_ATTENDANCE,
  WORKSPACE_MEETING_ACTION_ITEMS,
  WORKSPACE_MEETING_ACTIVITY,
  WORKSPACE_MEETING_ATTACHMENT_DOWNLOAD_URL,
  WORKSPACE_MEETING_ATTACHMENTS,
  WORKSPACE_MEETING_BY_ID,
  WORKSPACE_MEETING_MEMBERS,
  WORKSPACE_MEETINGS,
  WORKSPACE_MEETINGS_INFO,
  WORKSPACE_REMOVE_MEETING_AGENDA_ITEM,
  WORKSPACE_REOPEN_MEETING,
  WORKSPACE_REORDER_MEETING_AGENDA,
  WORKSPACE_RESPOND_TO_MEETING,
  WORKSPACE_SET_MEETING_ACTION_ITEM_STATUS,
  WORKSPACE_SET_MEETING_MINUTES,
  WORKSPACE_SET_MEETING_PARTICIPANT_ROLE,
  WORKSPACE_SET_MEETING_PARTICIPANTS,
  WORKSPACE_UPDATE_MEETING,
  WORKSPACE_UPDATE_MEETING_ACTION_ITEM,
  WORKSPACE_UPDATE_MEETING_AGENDA_ITEM,
} from './gql';

const notNull = <T>(value: T | null | undefined): value is T => value != null;

/** The server's message and error code, from an Apollo or network error. */
const toMeetingsError = (error: unknown): MeetingsError => {
  if (error instanceof MeetingsError) return error;
  const [graphQLError] =
    (
      error as {
        errors?: Array<{ message?: string; extensions?: { code?: unknown } }>;
      }
    )?.errors ?? [];
  if (graphQLError?.message) {
    const code = graphQLError.extensions?.code;
    return new MeetingsError(
      graphQLError.message,
      typeof code === 'string' ? code : null
    );
  }
  return new MeetingsError(
    error instanceof Error ? error.message : 'Something went wrong.'
  );
};

const mapMeeting = (meeting: WorkspaceMeetingFieldsFragment): Meeting => ({
  _id: meeting._id!,
  title: meeting.title ?? '',
  description: meeting.description ?? null,
  location: meeting.location ?? null,
  onlineUrl: meeting.onlineUrl ?? null,
  startsAt: meeting.startsAt ?? '0',
  endsAt: meeting.endsAt ?? '0',
  status: (meeting.status ?? 'scheduled') as MeetingStatus,
  cancelledAt: meeting.cancelledAt ?? null,
  cancelledByName: meeting.cancelledByName ?? null,
  cancellationReason: meeting.cancellationReason ?? null,
  completedAt: meeting.completedAt ?? null,
  completedByName: meeting.completedByName ?? null,
  participants: (meeting.participants ?? []).filter(notNull).map(p => ({
    participantId: p.participantId!,
    name: p.name ?? null,
    role: (p.role ?? 'required') as ParticipantRole,
    rsvpStatus: (p.rsvpStatus ?? 'pending') as RsvpStatus,
    rsvpRespondedAt: p.rsvpRespondedAt ?? null,
    rsvpComment: p.rsvpComment ?? null,
    attendanceStatus: (p.attendanceStatus ?? null) as AttendanceStatus | null,
    attendanceNote: p.attendanceNote ?? null,
    attendanceMarkedAt: p.attendanceMarkedAt ?? null,
    attendanceMarkedByName: p.attendanceMarkedByName ?? null,
    isMe: !!p.isMe,
  })),
  agenda: (meeting.agenda ?? []).filter(notNull).map(item => ({
    _id: item._id!,
    title: item.title ?? '',
    description: item.description ?? null,
    durationMinutes: item.durationMinutes ?? null,
    presenterId: item.presenterId ?? null,
    presenterName: item.presenterName ?? null,
  })),
  minutes: meeting.minutes ?? null,
  minutesUpdatedAt: meeting.minutesUpdatedAt ?? null,
  minutesUpdatedByName: meeting.minutesUpdatedByName ?? null,
  attachmentCount: meeting.attachmentCount ?? 0,
  openActionItemCount: meeting.openActionItemCount ?? 0,
  myRsvpStatus: (meeting.myRsvpStatus ?? null) as RsvpStatus | null,
  createdAt: meeting.createdAt ?? null,
  createdByName: meeting.createdByName ?? null,
  updatedAt: meeting.updatedAt ?? null,
  updatedByName: meeting.updatedByName ?? null,
});

const mapAttachment = (
  attachment: WorkspaceMeetingAttachmentFieldsFragment
): MeetingAttachment => ({
  _id: attachment._id!,
  name: attachment.name ?? '',
  description: attachment.description ?? null,
  fileName: attachment.fileName ?? '',
  mimeType: attachment.mimeType ?? '',
  size: attachment.size ?? 0,
  createdAt: attachment.createdAt ?? null,
  createdByName: attachment.createdByName ?? null,
  canDelete: !!attachment.canDelete,
});

const mapActionItem = (
  item: WorkspaceMeetingActionItemFieldsFragment
): MeetingActionItem => ({
  _id: item._id!,
  meetingId: item.meetingId ?? '',
  meetingTitle: item.meetingTitle ?? null,
  agendaItemId: item.agendaItemId ?? null,
  title: item.title ?? '',
  description: item.description ?? null,
  assigneeId: item.assigneeId ?? null,
  assigneeName: item.assigneeName ?? null,
  dueDate: item.dueDate ?? null,
  status: (item.status ?? 'open') as ActionItemStatus,
  completedAt: item.completedAt ?? null,
  completedByName: item.completedByName ?? null,
  createdAt: item.createdAt ?? null,
  createdByName: item.createdByName ?? null,
  canChangeStatus: !!item.canChangeStatus,
});

const parseDetails = (details: string | null | undefined) => {
  if (!details) return {};
  try {
    return JSON.parse(details) as Record<string, unknown>;
  } catch {
    return {};
  }
};

/**
 * PUTs a file to a presigned storage URL. XMLHttpRequest rather than fetch,
 * for upload progress.
 */
const putFile = (
  url: string,
  file: File,
  contentType: string,
  onProgress?: (fraction: number) => void
) =>
  new Promise<void>((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('PUT', url);
    request.setRequestHeader('Content-Type', contentType);
    request.upload.onprogress = event => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total);
      }
    };
    request.onload = () => {
      if (request.status >= 200 && request.status < 300) resolve();
      else {
        reject(
          new MeetingsError(`Could not upload the file (${request.status}).`)
        );
      }
    };
    request.onerror = () =>
      reject(new MeetingsError('Could not upload the file.'));
    request.send(file);
  });

/**
 * Meetings data for a committee in Workspaces: GraphQL for everything, and
 * direct uploads of attachments to storage through presigned URLs.
 */
export default class CommitteeMeetingsProvider implements MeetingsDataProvider {
  constructor(
    private readonly client: ApolloClient,
    private readonly committeeId: string
  ) {}

  private async run<T>(action: () => Promise<T>): Promise<T> {
    try {
      return await action();
    } catch (error) {
      throw toMeetingsError(error);
    }
  }

  private query<TData>(
    query: Parameters<ApolloClient['query']>[0]['query'],
    variables: Record<string, unknown> = {}
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.query({
        query,
        variables: { committeeId: this.committeeId, ...variables },
        fetchPolicy: 'network-only',
      });
      return data as TData;
    });
  }

  private mutate<TData>(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    variables: Record<string, unknown>
  ): Promise<TData> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation,
        variables: { committeeId: this.committeeId, ...variables },
      });
      return data as TData;
    });
  }

  /** Runs a mutation that returns the updated meeting under `field`. */
  private async mutateMeeting(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    field: string,
    variables: Record<string, unknown>
  ): Promise<Meeting> {
    const data = await this.mutate<
      Record<string, WorkspaceMeetingFieldsFragment | null>
    >(mutation, variables);
    const meeting = data?.[field];
    if (!meeting?._id) throw new MeetingsError('The meeting was not returned.');
    return mapMeeting(meeting);
  }

  private async mutateActionItem(
    mutation: Parameters<ApolloClient['mutate']>[0]['mutation'],
    field: string,
    variables: Record<string, unknown>
  ): Promise<MeetingActionItem> {
    const data = await this.mutate<
      Record<string, WorkspaceMeetingActionItemFieldsFragment | null>
    >(mutation, variables);
    const item = data?.[field];
    if (!item?._id) {
      throw new MeetingsError('The action item was not returned.');
    }
    return mapActionItem(item);
  }

  async getInfo(): Promise<MeetingsInfo> {
    const data = await this.query<{
      workspaceMeetingsInfo?: {
        canManage?: boolean | null;
        myParticipantId?: string | null;
        maxFileSize?: number | null;
      } | null;
    }>(WORKSPACE_MEETINGS_INFO);
    const info = data?.workspaceMeetingsInfo;
    return {
      canManage: !!info?.canManage,
      myParticipantId: info?.myParticipantId ?? null,
      maxFileSize: info?.maxFileSize ?? 0,
    };
  }

  async loadMembers(): Promise<MeetingMember[]> {
    const data = await this.query<{
      workspaceMeetingMembers?: Array<{
        participantId?: string | null;
        name?: string | null;
        isCoordinator?: boolean | null;
      } | null> | null;
    }>(WORKSPACE_MEETING_MEMBERS);
    return (data?.workspaceMeetingMembers ?? [])
      .filter(notNull)
      .filter(member => !!member.participantId)
      .map(member => ({
        participantId: member.participantId!,
        name: member.name ?? null,
        isCoordinator: !!member.isCoordinator,
      }));
  }

  async loadMeetings({
    view,
    from,
    to,
    text,
    pageIndex,
    pageSize,
  }: MeetingsQuery): Promise<MeetingPage> {
    const data = await this.query<{
      workspaceMeetings?: {
        data?: Array<WorkspaceMeetingFieldsFragment | null> | null;
        totalResults?: number | null;
      } | null;
    }>(WORKSPACE_MEETINGS, {
      view,
      from: from ?? null,
      to: to ?? null,
      text: text ?? null,
      pageIndex,
      pageSize,
    });
    return {
      meetings: (data?.workspaceMeetings?.data ?? [])
        .filter(notNull)
        .map(mapMeeting),
      totalResults: data?.workspaceMeetings?.totalResults ?? 0,
    };
  }

  async loadMeeting(meetingId: string): Promise<Meeting | null> {
    try {
      const data = await this.query<{
        workspaceMeetingById?: WorkspaceMeetingFieldsFragment | null;
      }>(WORKSPACE_MEETING_BY_ID, { meetingId });
      const meeting = data?.workspaceMeetingById;
      return meeting?._id ? mapMeeting(meeting) : null;
    } catch (error) {
      if (error instanceof MeetingsError && error.code === 'NOT_FOUND') {
        return null;
      }
      throw error;
    }
  }

  createMeeting(
    details: MeetingDetails,
    participantIds: string[]
  ): Promise<Meeting> {
    return this.mutateMeeting(WORKSPACE_CREATE_MEETING, 'workspaceCreateMeeting', {
      input: details,
      participantIds,
    });
  }

  updateMeeting(meetingId: string, details: MeetingDetails): Promise<Meeting> {
    return this.mutateMeeting(WORKSPACE_UPDATE_MEETING, 'workspaceUpdateMeeting', {
      meetingId,
      input: details,
    });
  }

  cancelMeeting(meetingId: string, reason?: string): Promise<Meeting> {
    return this.mutateMeeting(WORKSPACE_CANCEL_MEETING, 'workspaceCancelMeeting', {
      meetingId,
      reason: reason ?? null,
    });
  }

  completeMeeting(meetingId: string): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_COMPLETE_MEETING,
      'workspaceCompleteMeeting',
      { meetingId }
    );
  }

  reopenMeeting(meetingId: string): Promise<Meeting> {
    return this.mutateMeeting(WORKSPACE_REOPEN_MEETING, 'workspaceReopenMeeting', {
      meetingId,
    });
  }

  async deleteMeeting(meetingId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_MEETING, { meetingId });
  }

  setParticipants(meetingId: string, participantIds: string[]): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_SET_MEETING_PARTICIPANTS,
      'workspaceSetMeetingParticipants',
      { meetingId, participantIds }
    );
  }

  setParticipantRole(
    meetingId: string,
    participantId: string,
    role: ParticipantRole
  ): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_SET_MEETING_PARTICIPANT_ROLE,
      'workspaceSetMeetingParticipantRole',
      { meetingId, participantId, role }
    );
  }

  respond(
    meetingId: string,
    status: RsvpStatus,
    comment?: string,
    participantId?: string
  ): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_RESPOND_TO_MEETING,
      'workspaceRespondToMeeting',
      {
        meetingId,
        status,
        comment: comment ?? null,
        participantId: participantId ?? null,
      }
    );
  }

  markAttendance(meetingId: string, entries: AttendanceEntry[]): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_MARK_MEETING_ATTENDANCE,
      'workspaceMarkMeetingAttendance',
      { meetingId, entries }
    );
  }

  addAgendaItem(meetingId: string, input: AgendaItemInput): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_ADD_MEETING_AGENDA_ITEM,
      'workspaceAddMeetingAgendaItem',
      { meetingId, input }
    );
  }

  updateAgendaItem(
    meetingId: string,
    agendaItemId: string,
    input: AgendaItemInput
  ): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_UPDATE_MEETING_AGENDA_ITEM,
      'workspaceUpdateMeetingAgendaItem',
      { meetingId, agendaItemId, input }
    );
  }

  removeAgendaItem(meetingId: string, agendaItemId: string): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_REMOVE_MEETING_AGENDA_ITEM,
      'workspaceRemoveMeetingAgendaItem',
      { meetingId, agendaItemId }
    );
  }

  reorderAgenda(meetingId: string, agendaItemIds: string[]): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_REORDER_MEETING_AGENDA,
      'workspaceReorderMeetingAgenda',
      { meetingId, agendaItemIds }
    );
  }

  setMinutes(meetingId: string, text: string | null): Promise<Meeting> {
    return this.mutateMeeting(
      WORKSPACE_SET_MEETING_MINUTES,
      'workspaceSetMeetingMinutes',
      { meetingId, text }
    );
  }

  async loadAttachments(meetingId: string): Promise<MeetingAttachment[]> {
    const data = await this.query<{
      workspaceMeetingAttachments?: Array<WorkspaceMeetingAttachmentFieldsFragment | null> | null;
    }>(WORKSPACE_MEETING_ATTACHMENTS, { meetingId });
    return (data?.workspaceMeetingAttachments ?? [])
      .filter(notNull)
      .map(mapAttachment);
  }

  uploadAttachment(
    meetingId: string,
    file: File,
    onProgress?: (fraction: number) => void
  ): Promise<void> {
    return this.run(async () => {
      const { data } = await this.client.mutate({
        mutation: WORKSPACE_CREATE_MEETING_ATTACHMENT_UPLOAD,
        variables: {
          committeeId: this.committeeId,
          meetingId,
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
        },
      });
      const upload = data?.workspaceCreateMeetingAttachmentUpload;
      if (!upload?.uploadId || !upload.url) {
        throw new MeetingsError('Could not start the upload.');
      }

      try {
        await putFile(
          upload.url,
          file,
          upload.contentType || file.type || 'application/octet-stream',
          onProgress
        );
        await this.client.mutate({
          mutation: WORKSPACE_COMPLETE_MEETING_ATTACHMENT_UPLOAD,
          variables: { committeeId: this.committeeId, uploadId: upload.uploadId },
        });
      } catch (error) {
        // Best effort: don't leave a pending upload (and its bytes) behind.
        await this.client
          .mutate({
            mutation: WORKSPACE_ABORT_MEETING_ATTACHMENT_UPLOAD,
            variables: {
              committeeId: this.committeeId,
              uploadId: upload.uploadId,
            },
          })
          .catch(() => undefined);
        throw error;
      }
    });
  }

  async getAttachmentUrl(attachmentId: string, inline = false): Promise<string> {
    const data = await this.mutate<{
      workspaceMeetingAttachmentDownloadUrl?: { url?: string | null } | null;
    }>(WORKSPACE_MEETING_ATTACHMENT_DOWNLOAD_URL, { attachmentId, inline });
    const url = data?.workspaceMeetingAttachmentDownloadUrl?.url;
    if (!url) throw new MeetingsError('Could not get a download link.');
    return url;
  }

  async deleteAttachment(attachmentId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_MEETING_ATTACHMENT, { attachmentId });
  }

  async loadActionItems({
    meetingId,
    assigneeId,
    status,
    pageIndex,
    pageSize,
  }: ActionItemsQuery): Promise<ActionItemPage> {
    const data = await this.query<{
      workspaceMeetingActionItems?: {
        data?: Array<WorkspaceMeetingActionItemFieldsFragment | null> | null;
        totalResults?: number | null;
      } | null;
    }>(WORKSPACE_MEETING_ACTION_ITEMS, {
      meetingId: meetingId ?? null,
      assigneeId: assigneeId ?? null,
      status: status ?? null,
      pageIndex,
      pageSize,
    });
    return {
      items: (data?.workspaceMeetingActionItems?.data ?? [])
        .filter(notNull)
        .map(mapActionItem),
      totalResults: data?.workspaceMeetingActionItems?.totalResults ?? 0,
    };
  }

  createActionItem(
    meetingId: string,
    input: ActionItemInput
  ): Promise<MeetingActionItem> {
    return this.mutateActionItem(
      WORKSPACE_CREATE_MEETING_ACTION_ITEM,
      'workspaceCreateMeetingActionItem',
      { meetingId, input }
    );
  }

  updateActionItem(
    actionItemId: string,
    input: ActionItemInput
  ): Promise<MeetingActionItem> {
    return this.mutateActionItem(
      WORKSPACE_UPDATE_MEETING_ACTION_ITEM,
      'workspaceUpdateMeetingActionItem',
      { actionItemId, input }
    );
  }

  setActionItemStatus(
    actionItemId: string,
    status: ActionItemStatus
  ): Promise<MeetingActionItem> {
    return this.mutateActionItem(
      WORKSPACE_SET_MEETING_ACTION_ITEM_STATUS,
      'workspaceSetMeetingActionItemStatus',
      { actionItemId, status }
    );
  }

  async deleteActionItem(actionItemId: string): Promise<void> {
    await this.mutate(WORKSPACE_DELETE_MEETING_ACTION_ITEM, { actionItemId });
  }

  async loadActivity(
    meetingId: string,
    before?: string
  ): Promise<MeetingActivity[]> {
    const data = await this.query<{
      workspaceMeetingActivity?: Array<{
        _id?: string | null;
        action?: string | null;
        userName?: string | null;
        at?: string | null;
        details?: string | null;
      } | null> | null;
    }>(WORKSPACE_MEETING_ACTIVITY, {
      meetingId,
      before: before ?? null,
      limit: 50,
    });
    return (data?.workspaceMeetingActivity ?? [])
      .filter(notNull)
      .map(entry => ({
        _id: entry._id!,
        action: entry.action ?? '',
        userName: entry.userName ?? null,
        at: entry.at ?? null,
        details: parseDetails(entry.details),
      }));
  }
}
