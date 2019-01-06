import { ModulePaths } from '/imports/ui/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static dutiesPath = `${ModulePaths.hr}/duties`;
  static dutiesNewFormPath = `${SubModulePaths.dutiesPath}/new`;
  static dutiesEditFormPath = `${SubModulePaths.dutiesPath}/:dutyId`;

  static dutyLocationsPath = `${ModulePaths.hr}/duty-locations`;
  static dutyLocationsNewFormPath = `${SubModulePaths.dutyLocationsPath}/new`;
  static dutyLocationsEditFormPath = `${SubModulePaths.dutyLocationsPath}/:dutyLocationId`;

  static karkunsPath = `${ModulePaths.hr}/karkuns`;
  static karkunsNewFormPath = `${SubModulePaths.karkunsPath}/new`;
  static karkunsEditFormPath = `${SubModulePaths.karkunsPath}/:karkunId`;
}
