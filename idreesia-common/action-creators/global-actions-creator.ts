import { ActionNames } from '../constants';

export function setLoggedInUserId(userId: string | null) {
  return {
    type: ActionNames.SET_LOGGED_IN_USER_ID,
    userId,
  };
}

export function setActiveModuleName(moduleName: string | null) {
  return {
    type: ActionNames.SET_ACTIVE_MODULE_NAME,
    activeModuleName: moduleName,
  };
}

export function setActiveSubModuleName(subModuleName: string | null) {
  return {
    type: ActionNames.SET_ACTIVE_SUBMODULE_NAME,
    activeSubModuleName: subModuleName,
  };
}

export function setBreadcrumbs(breadcrumbs: unknown[]) {
  return {
    type: ActionNames.SET_BREADCRUMB,
    breadcrumbs,
  };
}
