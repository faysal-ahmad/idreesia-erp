import { Dispatch } from 'react-redux';

import { ActionNames } from '../constants';

class GlobalActionsCreator {
  setActiveModuleName(moduleName) {
    return {
      type: ActionNames.GLOBAL_SET_ACTIVE_MODULE_NAME,
      activeModuleName: moduleName
    };
  }

  setActiveSubModuleName(subModuleName) {
    return {
      type: ActionNames.GLOBAL_SET_ACTIVE_SUBMODULE_NAME,
      activeSubModuleName: subModuleName
    };
  }

  setBreadcrumbs(breadcrumbs) {
    return {
      type: ActionNames.GLOBAL_SET_BREADCRUMB,
      breadcrumbs: breadcrumbs
    };
  }
}

export default new GlobalActionsCreator();
