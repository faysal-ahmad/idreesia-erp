import { ModulePaths } from '/imports/ui/constants';

export default class SubModulePaths {
  // *************************************************************************************
  // Data Setup Routes
  // *************************************************************************************
  static profilesPath = `${ModulePaths.admin}/profiles`;
  static profilesNewFormPath = `${SubModulePaths.profilesPath}/new`;
  static profilesEditFormPath = `${SubModulePaths.profilesPath}/:profileId`;
}
