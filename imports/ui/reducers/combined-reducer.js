import { combineReducers } from 'redux';
import { activeModuleName, activeSubModuleName } from './global-reducer';

const combinedReducer = combineReducers({
  activeModuleName: activeModuleName,
  activeSubModuleName: activeSubModuleName
});

export default combinedReducer;
