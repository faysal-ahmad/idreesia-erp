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
}

export default new GlobalActionsCreator();
