import { ActionNames } from '/imports/ui/constants';

export function activeModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.GLOBAL_SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME) {
    newValue = action.activeModuleName;
  }

  return newValue;
}

export function activeSubModuleName(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.GLOBAL_SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME) {
    newValue = action.activeSubModuleName;
  }

  return newValue;
}
