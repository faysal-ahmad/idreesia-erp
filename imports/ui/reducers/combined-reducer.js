import { combineReducers } from 'redux';
import { activeModuleName, activeSubModuleName, breadcrumbs } from './global-reducer';

const combinedReducer = combineReducers({
  activeModuleName: activeModuleName,
  activeSubModuleName: activeSubModuleName,
  breadcrumbs: breadcrumbs
});

export default combinedReducer;
