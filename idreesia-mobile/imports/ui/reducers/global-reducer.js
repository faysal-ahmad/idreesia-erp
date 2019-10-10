import { ActionNames } from 'meteor/idreesia-common/constants';

export function loggedInUser(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_LOGGED_IN_USER) {
    newValue = action.user;
  }

  return newValue;
}

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

export function breadcrumbs(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = [];
  else newValue = previousValue;

  if (action.type === ActionNames.SET_BREADCRUMB) {
    newValue = action.breadcrumbs;
  }

  return newValue;
}