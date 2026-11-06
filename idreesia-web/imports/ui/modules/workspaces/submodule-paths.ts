import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // Base path for a committee workspace. Committee sub-modules are nested
  // under this path.
  static committeePath(committeeId = ':committeeId') {
    return `${ModulePaths.workspaces}/committees/${committeeId}`;
  }

  static committeeMembersPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/members`;
  }

  static committeeDiscussionsPath(committeeId = ':committeeId') {
    return `${SubModulePaths.committeePath(committeeId)}/discussions`;
  }
}
