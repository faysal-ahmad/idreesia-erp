import { GraphQLError } from 'graphql';

import {
  getActionItem,
  getAttachment,
  getMeeting,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import {
  areCommitteeMembers,
  getCommitteeMeetingsWorkspaceId,
  getMeetingUploadWorkspaceId,
  type CommitteeDoc,
  type ViewContext,
} from 'meteor/idreesia-common/server/business-logic/hr/committee';

import {
  getMemberCommittee,
  isCommitteeCoordinator,
  type WorkspaceUser,
} from '../committee/access';

export interface MeetingsAccess extends ViewContext {
  /** The committee's meetings workspace. */
  workspaceId: string;
  committee: CommitteeDoc;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * Permission check for a committee's meetings: the user must be a member of
 * the committee (erp-admin counts as one), and the committee must have
 * Meetings enabled. With `coordinator`, only its coordinators pass - for
 * scheduling and managing meetings, attendance, agenda, minutes and action
 * items.
 */
export const getMeetingsAccess = async (
  user: WorkspaceUser | null | undefined,
  committeeId: string,
  { coordinator = false }: { coordinator?: boolean } = {}
): Promise<MeetingsAccess> => {
  const committee = await getMemberCommittee(user, committeeId);
  if (!committee || !user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  const workspaceId = getCommitteeMeetingsWorkspaceId(
    committee as unknown as CommitteeDoc
  );
  const isCoordinator = isCommitteeCoordinator(user, committee);
  if (coordinator && !isCoordinator) {
    throw forbidden('Only coordinators of this committee can do this.');
  }
  return {
    workspaceId,
    committee: committee as unknown as CommitteeDoc,
    userId: user._id,
    personId: user.personId ?? null,
    isCoordinator,
  };
};

/*
 * The meetings module takes item ids on their own, so each id from the
 * client is checked to belong to the committee's workspace before it is
 * acted on.
 */

export const assertMeetingInWorkspace = async (
  access: MeetingsAccess,
  meetingId: string
) => {
  const meeting = await getMeeting(meetingId, access.userId);
  if (meeting.workspaceId !== access.workspaceId) {
    throw notFound('Meeting not found');
  }
  return meeting;
};

export const assertAttachmentInWorkspace = async (
  access: MeetingsAccess,
  attachmentId: string
) => {
  const attachment = await getAttachment(attachmentId, access.userId);
  if (attachment.workspaceId !== access.workspaceId) {
    throw notFound('Attachment not found');
  }
  return attachment;
};

export const assertUploadInWorkspace = async (
  access: MeetingsAccess,
  uploadId: string
) => {
  if ((await getMeetingUploadWorkspaceId(uploadId)) !== access.workspaceId) {
    throw notFound('Upload not found');
  }
};

export const assertActionItemInWorkspace = async (
  access: MeetingsAccess,
  actionItemId: string
) => {
  const item = await getActionItem(actionItemId, access.userId);
  if (item.workspaceId !== access.workspaceId) {
    throw notFound('Action item not found');
  }
  return item;
};

/** Participants, presenters and assignees must be committee members. */
export const assertMembers = (
  access: MeetingsAccess,
  personIds: Array<string | null | undefined>
) => {
  if (!areCommitteeMembers(access.committee, personIds)) {
    throw new GraphQLError('Only members of this committee can be chosen.', {
      extensions: { code: 'BAD_USER_INPUT' },
    });
  }
};
