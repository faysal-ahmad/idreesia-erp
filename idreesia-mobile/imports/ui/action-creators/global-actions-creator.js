import { ActionNames } from '../constants';

class GlobalActionsCreator {
  setActiveModuleAndSubModuleName(moduleName, subModuleName) {
    return {
      type: ActionNames.GLOBAL_SET_ACTIVE_MODULE_AND_SUB_MODULE_NAME,
      activeModuleName: moduleName,
      activeSubModuleName: subModuleName,
    };
  }
}

export default new GlobalActionsCreator();
