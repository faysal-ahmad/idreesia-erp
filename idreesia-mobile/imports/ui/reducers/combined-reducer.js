import { combineReducers } from 'redux';
import { breadcrumbs, loggedInUserId } from './global-reducer';
import {
  activeModuleName,
  activeSubModuleName,
  drawerOpen,
} from './mobile-reducer';

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
  drawerOpen,
  loggedInUserId,
});

export default combinedReducer;
