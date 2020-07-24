import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorsPath = `${ModulePaths.operations}/visitors`;
  static visitorsNewFormPath = `${SubModulePaths.visitorsPath}/new`;
  static visitorsScanFormPath = `${SubModulePaths.visitorsPath}/scan`;
  static visitorsEditFormPath(visitorId = ':visitorId') {
    return `${SubModulePaths.visitorsPath}/${visitorId}`;
  }

  // *************************************************************************************
  // Messages Routes
  // *************************************************************************************
  static messagesPath = `${ModulePaths.operations}/messages`;
  static messagesNewFormPath = `${SubModulePaths.messagesPath}/new`;
  static messagesEditFormPath(messageId = ':messageId') {
    return `${SubModulePaths.messagesPath}/${messageId}`;
  }

  // *************************************************************************************
  // Wazaif Routes
  // *************************************************************************************
  static wazaifPath = `${ModulePaths.operations}/wazaif`;
  static wazaifNewFormPath = `${SubModulePaths.wazaifPath}/new`;
  static wazaifEditFormPath(wazeefaId = ':wazeefaId') {
    return `${SubModulePaths.wazaifPath}/${wazeefaId}`;
  }

  // *************************************************************************************
  // Report Routes
  // *************************************************************************************
  static imdadRequestReportPath = `${ModulePaths.operations}/imdad-request-report`;
  static mulakaatReportPath = `${ModulePaths.operations}/mulakaat-report`;
  static newEhadReportPath = `${ModulePaths.operations}/new-ehad-report`;
}
