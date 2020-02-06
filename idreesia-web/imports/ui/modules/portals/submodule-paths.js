import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Karkun Routes
  // *************************************************************************************
  static karkunsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/karkuns`;
  }
  static karkunsNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.karkunsPath(portalId)}/new`;
  }
  static karkunsEditFormPath(portalId = ':portalId', karkunId = ':karkunId') {
    return `${SubModulePaths.karkunsPath(portalId)}/${karkunId}`;
  }

  // *************************************************************************************
  // Visitor Routes
  // *************************************************************************************
  static visitorsPath(portalId = ':portalId') {
    return `${ModulePaths.portals}/${portalId}/visitors`;
  }
  static visitorsNewFormPath(portalId = ':portalId') {
    return `${SubModulePaths.visitorsPath(portalId)}/new`;
  }
  static visitorsEditFormPath(
    portalId = ':portalId',
    visitorId = ':visitorId'
  ) {
    return `${SubModulePaths.visitorsPath(portalId)}/${visitorId}`;
  }
}
