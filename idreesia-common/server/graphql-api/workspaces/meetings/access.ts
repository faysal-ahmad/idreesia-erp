import { GraphQLError } from 'graphql';

import {
  getActionItem,
  getAttachment,
  getMeeting,
} from 'meteor/idreesia-common/server/business-logic/meetings';
import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';
import {
  areCommitteeMembers,
  getCommitteeMeetingsWorkspaceId,
  getMeetingUploadWorkspaceId,
  type CommitteeDoc,
  type ViewContext,
} from 'meteor/idreesia-common/server/business-logic/admin/committee';

import {
  getCommitteeAccess,
  type CommitteeAccessContext,
} from '../committee/access';

export interface MeetingsAccess extends ViewContext {
  /** The committee's meetings workspace. */
  workspaceId: string;
  committee: CommitteeDoc;
  /**
   * A guest sees and acts only in the meetings they are invited to. In those
   * they have the same rights as a member.
   */
  isGuest: boolean;
  /** Observers can read meetings but not join their video calls. */
  canJoinVideoCall: boolean;
}

const forbidden = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } });

const notFound = (message: string) =>
  new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } });

/**
 * What a meetings resolver works with, built from what
 * `@checkCommitteeAccess` found: who may call the field is decided by the
 * directive in the schema. Here the committee must also have Meetings enabled.
 */
export const getMeetingsAccess = (
  context: CommitteeAccessContext,
  committeeId: string
): MeetingsAccess => {
  const { committee, role, isCoordinator } = getCommitteeAccess(
    context,
    committeeId
  );
  const { user } = context;
  if (!user?._id) {
    throw forbidden('You are not a member of this committee.');
  }
  return {
    workspaceId: getCommitteeMeetingsWorkspaceId(
      committee as unknown as CommitteeDoc
    ),
    committee: committee as unknown as CommitteeDoc,
    userId: user._id,
    personId: user.personId ?? null,
    isCoordinator,
    isGuest: role === CommitteeMemberRoles.GUEST,
    canJoinVideoCall: role !== CommitteeMemberRoles.OBSERVER,
  };
};

/**
 * The person id to narrow meeting lists to: a guest's own, since they only
 * see meetings they are invited to. Undefined for everyone else.
 */
export const guestParticipantId = (access: MeetingsAccess) =>
  access.isGuest ? access.personId ?? '-' : undefined;

/*
 * The meetings module takes item ids on their own, so each id from the
 * client is checked to belong to the committee's workspace before it is
 * acted on. A guest also has to be invited to the meeting.
 */

const assertGuestInvited = (
  access: MeetingsAccess,
  meeting: { participants: Array<{ participantId: string }> }
) => {
  if (
    access.isGuest &&
    !meeting.participants.some(
      ({ participantId }) => participantId === access.personId
    )
  ) {
    throw notFound('Meeting not found');
  }
};

export const assertMeetingInWorkspace = async (
  access: MeetingsAccess,
  meetingId: string
) => {
  const meeting = await getMeeting(meetingId, access.userId);
  if (meeting.workspaceId !== access.workspaceId) {
    throw notFound('Meeting not found');
  }
  assertGuestInvited(access, meeting);
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
  if (access.isGuest) {
    const meeting = await getMeeting(attachment.meetingId, access.userId);
    assertGuestInvited(access, meeting);
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
  if (access.isGuest) {
    const meeting = await getMeeting(item.meetingId, access.userId);
    assertGuestInvited(access, meeting);
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
