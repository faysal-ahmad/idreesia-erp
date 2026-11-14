export const CommitteeMemberRoles = {
  MEMBER: 'member',
  COORDINATOR: 'coordinator',
  GUEST: 'guest',
  OBSERVER: 'observer',
} as const;

export type CommitteeMemberRole =
  (typeof CommitteeMemberRoles)[keyof typeof CommitteeMemberRoles];

export const CommitteeMemberRoleValues: CommitteeMemberRole[] =
  Object.values(CommitteeMemberRoles);
