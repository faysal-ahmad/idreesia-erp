import {
  CommitteeMemberRoles,
  type CommitteeMemberRole,
} from 'meteor/idreesia-common/constants/organization';

export const MEMBER_ROLE_LABELS: Record<CommitteeMemberRole, string> = {
  [CommitteeMemberRoles.MEMBER]: 'Member',
  [CommitteeMemberRoles.COORDINATOR]: 'Coordinator',
  [CommitteeMemberRoles.GUEST]: 'Guest',
  [CommitteeMemberRoles.OBSERVER]: 'Observer',
};

export const MEMBER_ROLE_COLORS: Record<CommitteeMemberRole, string> = {
  [CommitteeMemberRoles.MEMBER]: 'blue',
  [CommitteeMemberRoles.COORDINATOR]: 'gold',
  [CommitteeMemberRoles.GUEST]: 'purple',
  [CommitteeMemberRoles.OBSERVER]: 'cyan',
};

// Unknown or missing values are treated as a plain member.
export const toMemberRole = (role?: string | null): CommitteeMemberRole =>
  role && role in MEMBER_ROLE_LABELS
    ? (role as CommitteeMemberRole)
    : CommitteeMemberRoles.MEMBER;
