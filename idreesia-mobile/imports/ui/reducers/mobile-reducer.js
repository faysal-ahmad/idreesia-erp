import { ActionNames } from 'meteor/idreesia-common/constants';

export function activeModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME) {
    newValue = action.activeModuleName;
  }

  return newValue;
}

export function activeSubModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME) {
    newValue = action.activeSubModuleName;
  }

  return newValue;
}

export function drawerOpen(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = false;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_DRAWER_OPEN) {
    newValue = action.drawerOpen;
  }

  return newValue;
}
