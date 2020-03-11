import { ModulePaths } from 'meteor/idreesia-common/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Wazaif Routes
  // *************************************************************************************
  static wazaifPath = `${ModulePaths.wazaifManagement}/wazaif`;
  static wazaifNewFormPath = `${SubModulePaths.wazaifPath}/new`;
  static wazaifEditFormPath(wazeefaId = ':wazeefaId') {
    return `${SubModulePaths.wazaifPath}/${wazeefaId}`;
  }
}
