import { useDispatch, useSelector } from 'react-redux';

import {
  setActiveModuleName as setActiveModuleNameAction,
  setActiveSubModuleName as setActiveSubModuleNameAction,
} from 'meteor/idreesia-common/action-creators';

const useActiveModule = () => {
  const dispatch = useDispatch();
  const activeModuleName = useSelector(state => state.activeModuleName);
  const activeSubModuleName = useSelector(state => state.activeSubModuleName);

  const setActiveModuleName = moduleName => {
    dispatch(setActiveModuleNameAction(moduleName));
  };

  const setActiveSubModuleName = subModuleName => {
    dispatch(setActiveSubModuleNameAction(subModuleName));
  };

  return {
    activeModuleName,
    activeSubModuleName,
    setActiveModuleName,
    setActiveSubModuleName,
  };
};

export default useActiveModule;
