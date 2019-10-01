import { ActionNames } from '../constants';

export function setActiveModuleName(moduleName) {
  return {
    type: ActionNames.GLOBAL_SET_ACTIVE_MODULE_NAME,
    activeModuleName: moduleName,
  };
}

export function setActiveSubModuleName(subModuleName) {
  return {
    type: ActionNames.GLOBAL_SET_ACTIVE_SUBMODULE_NAME,
    activeSubModuleName: subModuleName,
  };
}

export function setBreadcrumbs(breadcrumbs) {
  return {
    type: ActionNames.GLOBAL_SET_BREADCRUMB,
    breadcrumbs,
  };
}

export function setActiveModuleAndSubModuleName(moduleName, subModuleName) {
  return {
    type: ActionNames.GLOBAL_SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME,
    activeModuleName: moduleName,
    activeSubModuleName: subModuleName,
  };
}
