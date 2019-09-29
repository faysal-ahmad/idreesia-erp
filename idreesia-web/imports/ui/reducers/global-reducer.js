import { ActionNames } from 'meteor/idreesia-common/constants';

export function breadcrumbs(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = [];
  else newValue = previousValue;

  if (action.type === ActionNames.GLOBAL_SET_BREADCRUMB) {
    newValue = action.breadcrumbs;
  }

  return newValue;
}

export function activeModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.GLOBAL_SET_ACTIVE_MODULE_NAME) {
    newValue = action.activeModuleName;
  }

  return newValue;
}

export function activeSubModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.GLOBAL_SET_ACTIVE_MODULE_NAME) {
    newValue = null;
  } else if (action.type === ActionNames.GLOBAL_SET_ACTIVE_SUBMODULE_NAME) {
    newValue = action.activeSubModuleName;
  }

  return newValue;
}
