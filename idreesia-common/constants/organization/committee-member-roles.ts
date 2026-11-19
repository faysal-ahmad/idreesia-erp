export const CommitteeMemberRoles = {
  MEMBER: 'member',
  COORDINATOR: 'coordinator',
  GUEST: 'guest',
  // Added directly on the committee; can be removed from the committee.
  OBSERVER: 'observer',
  // Inherited from an observer of a parent location; managed through the
  // location's observers, never from the committee itself.
  INHERITED_OBSERVER: 'inherited_observer',
} as const;

export type CommitteeMemberRole =
  (typeof CommitteeMemberRoles)[keyof typeof CommitteeMemberRoles];

export const CommitteeMemberRoleValues: CommitteeMemberRole[] =
  Object.values(CommitteeMemberRoles);
