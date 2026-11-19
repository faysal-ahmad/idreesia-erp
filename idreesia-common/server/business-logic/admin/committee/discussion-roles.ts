import { CommitteeMemberRoles } from 'meteor/idreesia-common/constants/organization';

// Observers (direct or inherited) and guests are not members of the committee's
// discussion chat group. Observers read discussions through the server and
// guests only see the projects and meetings they have been added to.
const NOT_IN_DISCUSSION: string[] = [
  CommitteeMemberRoles.GUEST,
  CommitteeMemberRoles.OBSERVER,
  CommitteeMemberRoles.INHERITED_OBSERVER,
];

/** Whether a member with this role belongs to the discussion chat group. */
export const hasDiscussionRole = (role?: string | null) =>
  !NOT_IN_DISCUSSION.includes(role ?? CommitteeMemberRoles.MEMBER);
