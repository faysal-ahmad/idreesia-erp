import { ModulePaths } from 'meteor/idreesia-common/constants';

// Same URLs as the web's Workspaces module (submodule-paths.ts there).
const committee = (committeeId: string) => `${ModulePaths.workspaces}/committees/${committeeId}`;

export const WorkspacesPaths = {
  /** Every workspace screen is under this path. */
  root: ModulePaths.workspaces,
  /** Route pattern for a committee's members screen. */
  committeeMembersPattern: `${committee(':committeeId')}/members`,
  committeeMembers: (committeeId: string) => `${committee(committeeId)}/members`,
  /** Route pattern for a committee's discussion; its screens are under it. */
  committeeDiscussionsPattern: `${committee(':committeeId')}/discussions`,
  committeeDiscussions: (committeeId: string) => `${committee(committeeId)}/discussions`,
  committeeDiscussionThreadPattern: `${committee(':committeeId')}/discussions/threads/:threadId`,
  committeeDiscussionThread: (committeeId: string, threadId: string) =>
    `${committee(committeeId)}/discussions/threads/${threadId}`,
  committeeDiscussionSearchPattern: `${committee(':committeeId')}/discussions/search`,
  committeeDiscussionSearch: (committeeId: string) => `${committee(committeeId)}/discussions/search`,
  committeeDiscussionPinnedPattern: `${committee(':committeeId')}/discussions/pinned`,
  committeeDiscussionPinned: (committeeId: string) => `${committee(committeeId)}/discussions/pinned`,
  committeeDiscussionStarredPattern: `${committee(':committeeId')}/discussions/starred`,
  committeeDiscussionStarred: (committeeId: string) => `${committee(committeeId)}/discussions/starred`,
  /** Route pattern for a committee's Night Stay Report. */
  committeeNightStayReportPattern: `${committee(':committeeId')}/night-stay-report`,
  committeeNightStayReport: (committeeId: string) => `${committee(committeeId)}/night-stay-report`,
  /** Route pattern for one stay opened from the Night Stay Report. */
  committeeNightStayPattern: `${committee(':committeeId')}/night-stay-report/:stayId`,
  committeeNightStay: (committeeId: string, stayId: string) =>
    `${committee(committeeId)}/night-stay-report/${stayId}`,
};
