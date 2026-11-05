import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // Base path for a committee workspace. Committee sub-modules will be
  // nested under this path.
  static committeePath(committeeId = ':committeeId') {
    return `${ModulePaths.workspaces}/committees/${committeeId}`;
  }
}
