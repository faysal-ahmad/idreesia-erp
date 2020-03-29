import { ActionNames } from '../constants';

export function setDrawerOpen(drawerOpen) {
  return {
    type: ActionNames.SET_DRAWER_OPEN,
    drawerOpen,
  };
}

export function setActiveModuleAndSubModuleName(moduleName, subModuleName) {
  return {
    type: ActionNames.SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME,
    activeModuleName: moduleName,
    activeSubModuleName: subModuleName,
  };
}
