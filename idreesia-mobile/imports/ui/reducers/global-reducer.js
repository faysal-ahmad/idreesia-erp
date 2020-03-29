import { ActionNames } from 'meteor/idreesia-common/constants';

export function loggedInUserId(previousValue, action) {
  let newValue;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_LOGGED_IN_USER_ID) {
    newValue = action.userId;
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
