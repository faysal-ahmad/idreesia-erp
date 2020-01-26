import { combineReducers } from 'redux';
import {
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
  loggedInUserId,
} from './global-reducer';

const combinedReducer = combineReducers({
  activeModuleName,
  activeSubModuleName,
  breadcrumbs,
  loggedInUserId,
});

export default combinedReducer;
