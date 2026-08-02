import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  setActiveModuleName as setActiveModuleNameAction,
  setActiveSubModuleName as setActiveSubModuleNameAction,
} from 'meteor/idreesia-common/action-creators';

interface ActiveModuleState {
  activeModuleName?: string | null;
  activeSubModuleName?: string | null;
}

const useActiveModule = () => {
  const dispatch = useDispatch();
  const activeModuleName = useSelector(
    (state: ActiveModuleState) => state.activeModuleName
  );
  const activeSubModuleName = useSelector(
    (state: ActiveModuleState) => state.activeSubModuleName
  );

  const setActiveModuleName = useCallback(
    (moduleName: string | null) => {
      dispatch(setActiveModuleNameAction(moduleName));
    },
    [dispatch]
  );

  const setActiveSubModuleName = useCallback(
    (subModuleName: string | null) => {
      dispatch(setActiveSubModuleNameAction(subModuleName));
    },
    [dispatch]
  );

  return {
    activeModuleName,
    activeSubModuleName,
    setActiveModuleName,
    setActiveSubModuleName,
  };
};

export default useActiveModule;
