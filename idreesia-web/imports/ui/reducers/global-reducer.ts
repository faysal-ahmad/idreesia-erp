import { ActionNames } from 'meteor/idreesia-common/constants';

interface GlobalAction {
  type: string;
  activeModuleName?: string | null;
  activeSubModuleName?: string | null;
  breadcrumbs?: unknown[];
  userId?: string | null;
}

export function loggedInUserId(
  previousValue: string | null | undefined,
  action: GlobalAction
): string | null {
  let newValue: string | null;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_LOGGED_IN_USER_ID) {
    newValue = action.userId ?? null;
  }

  return newValue;
}

export function breadcrumbs(
  previousValue: unknown[] | undefined,
  action: GlobalAction
): unknown[] {
  let newValue: unknown[];
  if (!previousValue) newValue = [];
  else newValue = previousValue;

  if (action.type === ActionNames.SET_BREADCRUMB) {
    newValue = action.breadcrumbs ?? [];
  }

  return newValue;
}

export function activeModuleName(
  previousValue: string | null | undefined,
  action: GlobalAction
): string | null {
  let newValue: string | null;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_ACTIVE_MODULE_NAME) {
    newValue = action.activeModuleName ?? null;
  }

  return newValue;
}

export function activeSubModuleName(
  previousValue: string | null | undefined,
  action: GlobalAction
): string | null {
  let newValue: string | null;
  if (!previousValue) newValue = null;
  else newValue = previousValue;

  if (action.type === ActionNames.SET_ACTIVE_MODULE_NAME) {
    newValue = null;
  } else if (action.type === ActionNames.SET_ACTIVE_SUBMODULE_NAME) {
    newValue = action.activeSubModuleName ?? null;
  }

  return newValue;
}
