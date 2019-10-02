import { ActionNames } from '../constants';

export function setLoggedInUser(user) {
  return {
    type: ActionNames.SET_LOGGED_IN_USER,
    user,
  };
}

export function setActiveModuleName(moduleName) {
  return {
    type: ActionNames.SET_ACTIVE_MODULE_NAME,
    activeModuleName: moduleName,
  };
}

export function setActiveSubModuleName(subModuleName) {
  return {
    type: ActionNames.SET_ACTIVE_SUBMODULE_NAME,
    activeSubModuleName: subModuleName,
  };
}

export function setBreadcrumbs(breadcrumbs) {
  return {
    type: ActionNames.SET_BREADCRUMB,
    breadcrumbs,
  };
}

export function setActiveModuleAndSubModuleName(moduleName, subModuleName) {
  return {
    type: ActionNames.SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME,
    activeModuleName: moduleName,
    activeSubModuleName: subModuleName,
  };
}
