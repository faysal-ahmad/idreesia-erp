import { ModuleNames } from 'meteor/idreesia-common/constants';
import {
  HrEmployeesPermissionCatalog,
  HrKarkunsPermissionCatalog,
  type HrPermissionGroup,
} from 'meteor/idreesia-common/constants/hr';

/**
 * One of the two HR modules, as its permission management sees it: the
 * module's name (stored on its user groups) and its permission catalog.
 * Each module's Permissions page manages only its own permissions and groups.
 */
export interface HrModuleScope {
  moduleName: string;
  catalog: HrPermissionGroup[];
}

export const HR_KARKUNS_MODULE: HrModuleScope = {
  moduleName: ModuleNames.hrKarkuns,
  catalog: HrKarkunsPermissionCatalog,
};

export const HR_EMPLOYEES_MODULE: HrModuleScope = {
  moduleName: ModuleNames.hrEmployees,
  catalog: HrEmployeesPermissionCatalog,
};

export const catalogKeys = (scope: HrModuleScope) =>
  scope.catalog.flatMap(group => group.permissions.map(permission => permission.key));
