import { combineReducers } from 'redux';
import { activeModuleName, activeSubModuleName, breadcrumbs } from './global-reducer';
import { listData } from './list-reducer';

const combinedReducer = combineReducers({
  activeModuleName: activeModuleName,
  activeSubModuleName: activeSubModuleName,
  breadcrumbs: breadcrumbs,

  listData: listData
});

export default combinedReducer;
