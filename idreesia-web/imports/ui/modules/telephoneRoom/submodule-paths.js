import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorsPath = `${ModulePaths.telephoneRoom}/visitors`;
  static visitorsNewFormPath = `${SubModulePaths.visitorsPath}/new`;
  static visitorsEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorsPath}/${visitorId}`;
  }
}
