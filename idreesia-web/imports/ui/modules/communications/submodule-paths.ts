import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Inbox Routes
  // *************************************************************************************
  static inboxPath = `${ModulePaths.communications}/inbox`;
  static inboxConversationPath(roomId = ':roomId?') {
    return `${SubModulePaths.inboxPath}/${roomId}`;
  }
}
