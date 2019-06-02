import { ModulePaths } from "/imports/ui/constants";

export default class SubModulePaths {
  // *************************************************************************************
  // Karkun Verification Routes
  // *************************************************************************************
  static karkunVerificationPath = `${ModulePaths.security}/karkun-verification`;

  // *************************************************************************************
  // Visitor Registration Routes
  // *************************************************************************************
  static visitorRegistrationPath = `${
    ModulePaths.security
  }/visitor-registration`;
  static visitorRegistrationNewFormPath = `${
    SubModulePaths.visitorRegistrationPath
  }/new`;
  static visitorRegistrationEditFormPath(visitorId = ":visitorId") {
    return `${SubModulePaths.visitorRegistrationPath}/${visitorId}`;
  }
}
