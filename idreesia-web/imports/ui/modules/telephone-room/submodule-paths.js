import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorsPath = `${ModulePaths.telephoneRoom}/visitors`;
  static visitorsNewFormPath = `${SubModulePaths.visitorsPath}/new`;
  static visitorsScanFormPath = `${SubModulePaths.visitorsPath}/scan`;
  static visitorsEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorsPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Report Routes
  // *************************************************************************************
  static imdadRequestReportPath = `${ModulePaths.telephoneRoom}/imdad-request-report`;
  static mulakaatReportPath = `${ModulePaths.telephoneRoom}/mulakaat-report`;
  static newEhadReportPath = `${ModulePaths.telephoneRoom}/new-ehad-report`;
}
