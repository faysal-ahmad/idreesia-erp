import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Messages Routes
  // *************************************************************************************
  static messagesPath = `${ModulePaths.communication}/messages`;
  static messagesNewFormPath = `${SubModulePaths.messagesPath}/new`;
  static messagesEditFormPath(messageId = ':messageId') {
    return `${SubModulePaths.messagesPath}/${messageId}`;
  }

  // ******************************************************************************
  // Audit Logs
  // ******************************************************************************
  static auditLogsPath = `${ModulePaths.communication}/audit-logs`;
}
